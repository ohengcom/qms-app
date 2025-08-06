# QMS - Quilts Management System 🛏️

**[English](README.md) | [中文](README_zh.md)**

> **Enhanced Intelligent Inventory Management for Home Bedding**

A sophisticated web application that transforms simple Excel-based quilt tracking into an intelligent inventory management system with seasonal recommendations, usage analytics, and predictive insights.

## 🌟 Features

### 📊 **Intelligent Dashboard**
- Real-time inventory overview with status tracking
- Seasonal distribution and usage analytics
- Quick access filters and search functionality
- Storage location optimization insights

### 🔍 **Advanced Search & Filtering**
- Multi-field search across name, brand, color, and notes
- Filter by season, status, location, weight range, and materials
- Smart suggestions and saved searches
- Real-time search results

### 🌱 **Seasonal Intelligence**
- Automatic seasonal classification (Winter/Spring-Autumn/Summer)
- Smart recommendations based on current season and weather
- Usage pattern analysis for optimal rotation
- Seasonal transition alerts and preparation reminders

### 📈 **Usage Analytics**
- Detailed usage history with timeline visualization
- Usage frequency and pattern analysis
- Predictive insights for next usage periods
- Maintenance scheduling based on usage patterns

### 🗂️ **Storage Optimization**
- Accessibility-based storage layout suggestions
- Location tracking with packaging information
- Storage efficiency analysis and optimization
- Visual storage organization tools

### 📱 **Modern UI/UX**
- Responsive design optimized for desktop, tablet, and mobile
- Intuitive Material Design interface with Element Plus
- Progressive Web App capabilities
- Offline support and caching

## 🏗️ Architecture

### Backend (FastAPI + SQLAlchemy)
```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # Database configuration
│   ├── models.py               # Enhanced SQLAlchemy models
│   ├── schema.py               # Pydantic schemas
│   ├── migration/
│   │   └── excel_importer.py   # Excel data migration
│   └── routers/
│       ├── quilts.py           # Legacy API (backward compatibility)
│       └── enhanced_quilts.py  # Enhanced API with advanced features
└── requirements.txt            # Python dependencies
```

### Frontend (Vue.js 3 + Element Plus)
```
frontend/
├── src/
│   ├── main.js                 # Application entry point
│   ├── App.vue                 # Main application component
│   ├── router/                 # Vue Router configuration
│   ├── stores/                 # Pinia state management
│   ├── components/             # Reusable Vue components
│   ├── views/                  # Page components
│   └── assets/                 # Static assets and styles
├── package.json                # Node.js dependencies
└── vite.config.js              # Vite build configuration
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📊 Data Migration

### Import from Excel
The system can import your existing Excel data automatically:

```bash
cd backend
python -c "from app.migration.excel_importer import run_migration; run_migration('家中被子列表.xlsx')"
```

Or use the web interface:
1. Navigate to the Import section in the web app
2. Upload your Excel file
3. Review and confirm the import

### Excel Format Support
The system supports Excel files with these columns:
- Group, 编号, 季节, 填充物, 颜色, 长, 宽, 重量（g）
- 放置位置, 包, 使用时间段, 品牌, 购买日期, 备注
- Historical usage columns: 上次使用, 上上次使用, etc.

## 🎯 Enhanced Data Model

### Quilt Entity
```python
- id: Primary key
- group_id: Excel Group classification
- item_number: Unique item number
- name: Descriptive name
- season: Seasonal classification (Winter/Spring-Autumn/Summer)
- length_cm, width_cm: Physical dimensions
- weight_grams: Weight for seasonal recommendations
- fill_material: Primary material
- material_details: Detailed composition
- color: Color description
- brand: Manufacturer
- purchase_date: Purchase date for lifecycle tracking
- location: Storage location
- packaging_info: Packaging details
- current_status: available/in_use/maintenance/storage
- notes: Additional notes
```

### Usage Tracking
- **Usage Periods**: Historical usage with start/end dates
- **Current Usage**: Active usage tracking
- **Usage Analytics**: Patterns, frequency, and predictions
- **Seasonal Analysis**: Season-based usage optimization

## 📚 API Documentation

### Core Endpoints

#### Quilts Management
- `GET /api/quilts/` - List quilts with filtering and search
- `GET /api/quilts/{id}` - Get detailed quilt information
- `POST /api/quilts/` - Create new quilt
- `PUT /api/quilts/{id}` - Update quilt information
- `DELETE /api/quilts/{id}` - Delete quilt

#### Seasonal Intelligence
- `GET /api/quilts/seasonal/{season}` - Get seasonal quilts
- `GET /api/quilts/recommendations/{season}` - Smart recommendations
- `GET /api/quilts/current-season` - Current season recommendations

#### Usage Management
- `POST /api/usage/start` - Start using a quilt
- `POST /api/usage/end/{id}` - End usage period
- `GET /api/usage/current` - Get currently in-use quilts
- `GET /api/usage/history/{id}` - Get usage history

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/usage-patterns` - Usage pattern analysis
- `GET /api/search` - Advanced search functionality

#### Data Management
- `POST /api/migration/excel-import` - Import from Excel
- `GET /api/export/excel` - Export to Excel

## 🛠️ Development

### Technology Stack
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Pandas
- **Frontend**: Vue.js 3, Element Plus, Vite, Pinia
- **Database**: SQLite (development), PostgreSQL (production)
- **Deployment**: Docker, Docker Compose

### Development Tools
- **Code Quality**: ESLint, Prettier, Black
- **Testing**: Vitest (frontend), Pytest (backend)
- **Build**: Vite (frontend), uvicorn (backend)

### Environment Variables
```bash
# Backend
DATABASE_URL=sqlite:///./quilts.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend  
VITE_API_BASE_URL=http://localhost:8000/api
```

## 📦 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Production Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Build frontend: `npm run build`
4. Deploy backend with gunicorn
5. Serve frontend with nginx

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/ -v
```

### Frontend Testing
```bash
cd frontend
npm run test:unit
npm run test:e2e
```

## 📋 Roadmap

### Phase 1: Foundation ✅
- [x] Enhanced database schema
- [x] Comprehensive API layer
- [x] Excel data migration
- [x] Vue.js frontend foundation

### Phase 2: Core Features (In Progress)
- [ ] Complete dashboard UI
- [ ] Quilt management forms
- [ ] Search and filtering UI
- [ ] Usage tracking interface

### Phase 3: Advanced Features
- [ ] Predictive analytics
- [ ] Maintenance scheduling
- [ ] Storage optimization
- [ ] Mobile app (PWA)

### Phase 4: Production
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deployment automation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**QMS v2.0** - Transforming simple inventory tracking into intelligent bedding management 🛏️✨
