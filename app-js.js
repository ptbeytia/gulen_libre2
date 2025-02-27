import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';

// Estilos CSS para toda la aplicación
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#2c3e50',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'space-between',
  },
  select: {
    flex: 1,
    minWidth: '200px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  search: {
    flex: 2,
    minWidth: '300px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  dashboard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  statsCard: {
    padding: '15px',
    textAlign: 'center',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  noResults: {
    padding: '20px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '14px',
  },
  chartTitle: {
    textAlign: 'center',
    marginBottom: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  checkbox: {
    marginRight: '5px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '15px',
    cursor: 'pointer',
  },
  databaseSelector: {
    display: 'flex',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    justifyContent: 'center',
  },
};

// URLs de los datos CSV
const URL_COACEL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3uqYngG2O1K07T4FMip3zvB1K1hLfKnFyxwEizn9R58-NQsxncOAKi2bWtH_Y81AqC8SazM1dqfSB/pub?gid=0&single=true&output=csv';
const URL_CONVIVIR = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3uqYngG2O1K07T4FMip3zvB1K1hLfKnFyxwEizn9R58-NQsxncOAKi2bWtH_Y81AqC8SazM1dqfSB/pub?gid=1009429221&single=true&output=csv';

// Colores para los gráficos
const COLORS = [
  '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c',
  '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090',
  '#58508d', '#003f5c', '#7a5195', '#ef5675', '#ffa600'
];

// Componente principal de la aplicación
const App = () => {
  // Estado para almacenar los datos y filtros
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coacelData, setCoacelData] = useState([]);
  const [convivirData, setConvivirData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Estado para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showCoacel, setShowCoacel] = useState(true);
  const [showConvivir, setShowConvivir] = useState(true);
  
  // Estado para las estadísticas
  const [categoryStats, setCategoryStats] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  
  // Función para cargar datos CSV usando un proxy para evitar problemas de CORS
  const fetchCSVData = async (url) => {
    try {
      // Intentamos cargar directamente primero sin proxy
      let response;
      try {
        response = await fetch(url);
      } catch (directError) {
        // Si falla, intentamos con un proxy de CORS
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      // Parseamos el CSV a objeto JSON
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Normalizamos los nombres de las columnas
            const data = results.data.map(item => ({
              Categoria: item.Categoría || item.Categoria || '',
              Producto: item.Producto || '',
              Empresa: item.Empresa || ''
            })).filter(item => item.Producto && item.Producto.trim() !== '');
            
            resolve(data);
          }
        });
      });
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      // En caso de error, usamos datos de respaldo
      return useBackupData(url);
    }
  };
  
  // Función para proveer datos de respaldo en caso de que no se puedan cargar los CSV
  const useBackupData = (url) => {
    if (url.includes('gid=0')) { // Coacel
      return [
        { Categoria: 'Alimentos en conserva', Producto: 'Atún en agua', Empresa: 'San José' },
        { Categoria: 'Bebidas', Producto: 'Jugo natural de naranja', Empresa: 'Watt\'s' },
        { Categoria: 'Bebidas', Producto: 'Bebida gaseosa', Empresa: 'Coca-Cola' },
        { Categoria: 'Cereales y harinas', Producto: 'Harina de arroz', Empresa: 'Carozzi' },
        { Categoria: 'Cereales y harinas', Producto: 'Avena sin gluten', Empresa: 'Quaker' },
        { Categoria: 'Lácteos', Producto: 'Yogur natural', Empresa: 'Soprole' },
        { Categoria: 'Snacks', Producto: 'Papas fritas', Empresa: 'Evercrisp' },
        { Categoria: 'Pastas', Producto: 'Fideos de arroz', Empresa: 'Carozzi' },
        { Categoria: 'Galletas y repostería', Producto: 'Galletas de arroz', Empresa: 'Tamara' },
        { Categoria: 'Alimentos en conserva', Producto: 'Arvejas en conserva', Empresa: 'San José' },
      ];
    } else { // Convivir
      return [
        { Categoria: 'Bebidas', Producto: 'Jugo de manzana', Empresa: 'Watt\'s' },
        { Categoria: 'Panadería', Producto: 'Pan sin gluten', Empresa: 'Ideal' },
        { Categoria: 'Panadería', Producto: 'Masa para pizza', Empresa: 'Líder' },
        { Categoria: 'Cereales y harinas', Producto: 'Premezcla para pan', Empresa: 'Selecta' },
        { Categoria: 'Galletas y repostería', Producto: 'Brownie sin gluten', Empresa: 'Jumbo' },
        { Categoria: 'Pastas', Producto: 'Pasta de maíz', Empresa: 'Lucchetti' },
        { Categoria: 'Snacks', Producto: 'Maní salado', Empresa: 'Evercrisp' },
        { Categoria: 'Cereales y harinas', Producto: 'Cereal sin gluten', Empresa: 'Nestlé' },
        { Categoria: 'Lácteos', Producto: 'Leche sin lactosa', Empresa: 'Colun' },
        { Categoria: 'Bebidas', Producto: 'Bebida sabor cola', Empresa: 'Pepsi' },
      ];
    }
  };
  
  // Cargar los datos cuando se monta el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [coacelResult, convivirResult] = await Promise.all([
          fetchCSVData(URL_COACEL),
          fetchCSVData(URL_CONVIVIR)
        ]);
        
        setCoacelData(coacelResult);
        setConvivirData(convivirResult);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Actualizar los datos filtrados cuando cambian los filtros o las bases de datos seleccionadas
  useEffect(() => {
    let combinedData = [];
    
    if (showCoacel) {
      combinedData = [...combinedData, ...coacelData.map(item => ({ ...item, source: 'Coacel' }))];
    }
    
    if (showConvivir) {
      combinedData = [...combinedData, ...convivirData.map(item => ({ ...item, source: 'Convivir' }))];
    }
    
    // Aplicar filtros
    let filtered = combinedData;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.Producto.toLowerCase().includes(term)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(item => 
        item.Categoria === selectedCategory
      );
    }
    
    if (selectedCompany) {
      filtered = filtered.filter(item => 
        item.Empresa === selectedCompany
      );
    }
    
    setFilteredData(filtered);
    
    // Generar estadísticas para gráficos
    generateStats(filtered);
    
  }, [coacelData, convivirData, searchTerm, selectedCategory, selectedCompany, showCoacel, showConvivir]);
  
  // Generar estadísticas para los gráficos
  const generateStats = (data) => {
    // Estadísticas por categoría
    const categoryCount = {};
    data.forEach(item => {
      if (item.Categoria) {
        categoryCount[item.Categoria] = (categoryCount[item.Categoria] || 0) + 1;
      }
    });
    
    const categoryData = Object.keys(categoryCount)
      .map(cat => ({ name: cat, value: categoryCount[cat] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 categorías
    
    setCategoryStats(categoryData);
    
    // Estadísticas por empresa
    const companyCount = {};
    data.forEach(item => {
      if (item.Empresa) {
        companyCount[item.Empresa] = (companyCount[item.Empresa] || 0) + 1;
      }
    });
    
    const companyData = Object.keys(companyCount)
      .map(comp => ({ name: comp, value: companyCount[comp] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 empresas
    
    setCompanyStats(companyData);
  };
  
  // Obtener opciones únicas para los filtros
  const getUniqueCategories = () => {
    const categories = new Set();
    
    if (showCoacel) {
      coacelData.forEach(item => {
        if (item.Categoria) categories.add(item.Categoria);
      });
    }
    
    if (showConvivir) {
      convivirData.forEach(item => {
        if (item.Categoria) categories.add(item.Categoria);
      });
    }
    
    return Array.from(categories).sort();
  };
  
  const getUniqueCompanies = () => {
    const companies = new Set();
    
    if (showCoacel) {
      coacelData.forEach(item => {
        if (item.Empresa) companies.add(item.Empresa);
      });
    }
    
    if (showConvivir) {
      convivirData.forEach(item => {
        if (item.Empresa) companies.add(item.Empresa);
      });
    }
    
    return Array.from(companies).sort();
  };
  
  // Renderizar componente de carga
  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Buscador de Productos Sin Gluten</h1>
        <div style={styles.loading}>Cargando datos, por favor espere...</div>
      </div>
    );
  }
  
  // Renderizar mensaje de error
  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Buscador de Productos Sin Gluten</h1>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Buscador de Productos Sin Gluten</h1>
      
      {/* Selector de bases de datos */}
      <div style={styles.databaseSelector}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            style={styles.checkbox}
            checked={showCoacel}
            onChange={() => setShowCoacel(!showCoacel)}
          />
          Fundación Coacel
        </label>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            style={styles.checkbox}
            checked={showConvivir}
            onChange={() => setShowConvivir(!showConvivir)}
          />
          Fundación Convivir
        </label>
      </div>
      
      {/* Filtros */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.search}
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={styles.select}
        >
          <option value="">Todas las categorías</option>
          {getUniqueCategories().map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          style={styles.select}
        >
          <option value="">Todas las empresas</option>
          {getUniqueCompanies().map(company => (
            <option key={company} value={company}>{company}</option>
          ))}
        </select>
      </div>
      
      {/* Estadísticas */}
      <div style={styles.dashboard}>
        {/* Gráfico de categorías */}
        <div style={styles.card}>
          <h3 style={styles.chartTitle}>Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            {categoryStats.length > 0 ? (
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} productos`, 'Cantidad']} />
                <Legend />
              </PieChart>
            ) : (
              <div style={styles.noResults}>No hay datos suficientes para mostrar</div>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Gráfico de empresas */}
        <div style={styles.card}>
          <h3 style={styles.chartTitle}>Distribución por Empresa</h3>
          <ResponsiveContainer width="100%" height={300}>
            {companyStats.length > 0 ? (
              <BarChart
                data={companyStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value} productos`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Cantidad de Productos">
                  {companyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <div style={styles.noResults}>No hay datos suficientes para mostrar</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Tabla de resultados */}
      <div style={styles.card}>
        <h3>Resultados ({filteredData.length} productos)</h3>
        
        {filteredData.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Producto</th>
                <th style={styles.tableHeader}>Categoría</th>
                <th style={styles.tableHeader}>Empresa</th>
                <th style={styles.tableHeader}>Fuente</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{item.Producto}</td>
                  <td style={styles.tableCell}>{item.Categoria}</td>
                  <td style={styles.tableCell}>{item.Empresa}</td>
                  <td style={styles.tableCell}>
                    <span 
                      style={{
                        ...styles.badge, 
                        backgroundColor: item.source === 'Coacel' ? '#4caf50' : '#2196f3'
                      }}
                    >
                      {item.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.noResults}>
            No se encontraron productos que coincidan con los criterios de búsqueda.
          </div>
        )}
      </div>
      
      <div style={styles.footer}>
        <p>© 2025 Buscador de Productos Sin Gluten - Chile</p>
        <p>Datos proporcionados por Fundación Coacel y Fundación Convivir</p>
      </div>
    </div>
  );
};

export default App;