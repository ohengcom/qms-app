import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional, Dict, Tuple
import re
from .. import models
from ..database import SessionLocal

class ExcelImporter:
    def __init__(self, db: Session):
        self.db = db
        self.season_mapping = {
            '冬': models.SeasonEnum.winter,
            '春秋': models.SeasonEnum.spring_autumn, 
            '夏': models.SeasonEnum.summer
        }
    
    def parse_date(self, date_string: str) -> Optional[date]:
        """Parse various date formats from Excel"""
        if not date_string or pd.isna(date_string):
            return None
        
        date_string = str(date_string).strip()
        if not date_string:
            return None
            
        # Try different date formats
        formats = ['%Y/%m/%d', '%Y-%m-%d', '%Y.%m.%d', '%Y/%m/%d %H:%M:%S']
        
        for fmt in formats:
            try:
                return datetime.strptime(date_string, fmt).date()
            except ValueError:
                continue
        
        # Handle special format like "2024-11-11"
        try:
            return datetime.strptime(date_string.split()[0], '%Y-%m-%d').date()
        except:
            print(f"Warning: Could not parse date: {date_string}")
            return None
    
    def parse_usage_period(self, period_string: str) -> Tuple[Optional[date], Optional[date]]:
        """Parse usage period strings like '2023/11/30~2024/05/04' or '2025/04/08~'"""
        if not period_string or pd.isna(period_string):
            return None, None
            
        period_string = str(period_string).strip()
        if not period_string or period_string == '':
            return None, None
        
        if '~' not in period_string:
            return None, None
        
        parts = period_string.split('~')
        start_date = self.parse_date(parts[0]) if parts[0] else None
        end_date = self.parse_date(parts[1]) if len(parts) > 1 and parts[1] else None
        
        return start_date, end_date
    
    def determine_current_status(self, row: Dict) -> models.StatusEnum:
        """Determine current status based on Excel data"""
        location = str(row.get('放置位置', '')).strip()
        
        if location == '在用':
            return models.StatusEnum.in_use
        elif any(keyword in location for keyword in ['壁柜', '衣柜', '箱']):
            return models.StatusEnum.available
        else:
            return models.StatusEnum.available
    
    def clean_material_composition(self, fill_material: str) -> Tuple[str, str]:
        """Clean and separate fill material from detailed composition"""
        if not fill_material or pd.isna(fill_material):
            return "未知", ""
        
        fill_material = str(fill_material).strip()
        
        # If it contains percentages, it's detailed composition
        if '%' in fill_material:
            # Extract main material (first mentioned)
            if '棉' in fill_material:
                main_material = '棉'
            elif '鹅绒' in fill_material:
                main_material = '鹅绒'
            elif '鸭绒' in fill_material:
                main_material = '鸭绒'
            elif '羊毛' in fill_material:
                main_material = '羊毛'
            elif '蚕丝' in fill_material:
                main_material = '蚕丝'
            elif '纤维' in fill_material:
                main_material = '纤维'
            else:
                main_material = fill_material.split('+')[0] if '+' in fill_material else fill_material
            
            return main_material, fill_material
        else:
            return fill_material, fill_material
    
    def generate_quilt_name(self, row: Dict) -> str:
        """Generate a descriptive name if not provided"""
        brand = str(row.get('品牌', '')).strip()
        season = str(row.get('季节', '')).strip()
        material = str(row.get('填充物', '')).strip()
        
        if brand and brand != 'nan':
            name = f"{brand} {season}被"
        else:
            name = f"{season}被"
        
        if material and material != 'nan':
            main_material = material.split('+')[0] if '+' in material else material
            name = f"{main_material} {name}"
        
        return name
    
    def import_from_excel(self, file_path: str) -> Dict:
        """Import quilts from Excel file"""
        try:
            # Read Excel file
            df = pd.read_excel(file_path, sheet_name=0)  # First sheet
            
            print(f"Loaded Excel file with {len(df)} rows")
            print(f"Columns: {list(df.columns)}")
            
            imported_quilts = []
            skipped_rows = []
            
            for index, row in df.iterrows():
                try:
                    # Skip if no item number
                    if pd.isna(row.get('编号')) or not row.get('编号'):
                        skipped_rows.append(f"Row {index + 1}: Missing item number")
                        continue
                    
                    # Extract basic information
                    item_number = int(row['编号'])
                    group_id = int(row['Group']) if not pd.isna(row.get('Group')) else None
                    season = self.season_mapping.get(str(row['季节']).strip(), models.SeasonEnum.winter)
                    
                    # Physical specifications
                    length_cm = int(row['长']) if not pd.isna(row.get('长')) else 200
                    width_cm = int(row['宽']) if not pd.isna(row.get('宽')) else 150
                    weight_grams = int(row['重量（g）']) if not pd.isna(row.get('重量（g）')) else 2000
                    
                    # Material information
                    fill_material, material_details = self.clean_material_composition(row.get('填充物'))
                    color = str(row.get('颜色', '未知')).strip()
                    
                    # Brand and purchase info
                    brand = str(row.get('品牌', '')).strip() if not pd.isna(row.get('品牌')) else None
                    purchase_date = self.parse_date(row.get('购买日期'))
                    
                    # Storage information
                    location = str(row.get('放置位置', '未知位置')).strip()
                    packaging_info = str(row.get('包', '')).strip() if not pd.isna(row.get('包')) else None
                    
                    # Status and notes
                    current_status = self.determine_current_status(row)
                    notes = str(row.get('备注', '')).strip() if not pd.isna(row.get('备注')) else None
                    
                    # Generate name if needed
                    name = self.generate_quilt_name(row)
                    
                    # Check if quilt already exists
                    existing = self.db.query(models.Quilt).filter(
                        models.Quilt.item_number == item_number
                    ).first()
                    
                    if existing:
                        print(f"Skipping item #{item_number}: Already exists")
                        continue
                    
                    # Create quilt record
                    quilt = models.Quilt(
                        group_id=group_id,
                        item_number=item_number,
                        name=name,
                        season=season,
                        length_cm=length_cm,
                        width_cm=width_cm,
                        weight_grams=weight_grams,
                        fill_material=fill_material,
                        material_details=material_details,
                        color=color,
                        brand=brand,
                        purchase_date=purchase_date,
                        location=location,
                        packaging_info=packaging_info,
                        current_status=current_status,
                        notes=notes
                    )
                    
                    self.db.add(quilt)
                    self.db.flush()  # Get the ID
                    
                    # Import usage history
                    self.import_usage_history(row, quilt.id)
                    
                    imported_quilts.append(quilt.item_number)
                    print(f"Imported quilt #{item_number}: {name}")
                
                except Exception as e:
                    skipped_rows.append(f"Row {index + 1}: {str(e)}")
                    print(f"Error importing row {index + 1}: {e}")
                    continue
            
            # Commit all changes
            self.db.commit()
            
            return {
                "imported_count": len(imported_quilts),
                "imported_quilts": imported_quilts,
                "skipped_count": len(skipped_rows),
                "skipped_rows": skipped_rows,
                "total_rows": len(df)
            }
        
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Error importing Excel file: {str(e)}")
    
    def import_usage_history(self, row: Dict, quilt_id: int):
        """Import usage history from Excel row"""
        # Current usage period
        current_usage = str(row.get('使用时间段', '')).strip()
        if current_usage and current_usage != '' and current_usage != 'nan':
            start_date, end_date = self.parse_usage_period(current_usage)
            if start_date:
                if end_date is None and current_usage.endswith('~'):
                    # Currently in use
                    current_usage_record = models.CurrentUsage(
                        quilt_id=quilt_id,
                        started_at=start_date,
                        usage_type="regular"
                    )
                    self.db.add(current_usage_record)
                else:
                    # Completed usage period
                    if end_date:
                        usage_period = models.QuiltUsagePeriod(
                            quilt_id=quilt_id,
                            start_date=start_date,
                            end_date=end_date,
                            season_used=self.determine_season_from_dates(start_date, end_date),
                            notes="Current usage period from Excel"
                        )
                        self.db.add(usage_period)
        
        # Historical usage periods
        history_columns = [
            '上次使用', '上上次使用', '上上上次使用', '上^4次', 
            '上^5次', '上^6次', '上^7次', '上^8次', '上^9次'
        ]
        
        for col in history_columns:
            period_str = str(row.get(col, '')).strip()
            if period_str and period_str != '' and period_str != 'nan':
                start_date, end_date = self.parse_usage_period(period_str)
                if start_date and end_date:  # Only add completed periods
                    usage_period = models.QuiltUsagePeriod(
                        quilt_id=quilt_id,
                        start_date=start_date,
                        end_date=end_date,
                        season_used=self.determine_season_from_dates(start_date, end_date),
                        notes=f"Historical usage ({col})"
                    )
                    self.db.add(usage_period)
    
    def determine_season_from_dates(self, start_date: date, end_date: Optional[date] = None) -> str:
        """Determine season based on usage dates"""
        if not start_date:
            return "unknown"
        
        # Use start date month to determine season
        month = start_date.month
        if month in [12, 1, 2]:
            return "winter"
        elif month in [6, 7, 8]:
            return "summer"
        else:
            return "spring_autumn"

def run_migration(excel_file_path: str = "家中被子列表.xlsx") -> Dict:
    """Run the Excel migration"""
    db = SessionLocal()
    try:
        importer = ExcelImporter(db)
        result = importer.import_from_excel(excel_file_path)
        return result
    finally:
        db.close()

if __name__ == "__main__":
    # Test the migration
    result = run_migration()
    print("\nMigration Results:")
    print(f"Imported: {result['imported_count']} quilts")
    print(f"Skipped: {result['skipped_count']} rows")
    if result['skipped_rows']:
        print("\nSkipped rows:")
        for skip in result['skipped_rows']:
            print(f"  - {skip}")