import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './admin.css';
import BloqueDeCarga from './dataCarga';
import SessionExpiration from '../SesionExpired';
import Solicitudes from './Solicitudes/solicitudes';

const AdminPage = () => {
  const [editingRow, setEditingRow] = useState(null);
  const [deletingRows, setDeletingRows] = useState([null]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [newRowData, setNewRowData] = useState({});
  const [sessionExpired, setSessionExpired] = useState(false);
  const [columns, setColumns] = useState([]);
  const [colors, setColors] = useState({
    '--color-nav-foot': '',
    '--color-menu-lateral': '',
'    --color-boton':'',
  '  --color-palabra-boton':'',
'    --color-boton-transicion':'',
   ' --color-cuadro':'',
 '   --color-subcuadro':'',
'    --color-sombras':'',
  '  --color-subtitulos':'',
'    --color-titulos':'',
  '  --color-bordes':'',
  '  --color-sombras-titulos':'',
   ' --color-fondo:':'',
  });

  const referencesToFetch = [
    '--color-nav-foot',
    '--color-menu-lateral',
    '--color-boton',
    '--color-palabra-boton',
    '--color-boton-transicion',
    '--color-cuadro',
    '--color-subcuadro',
    '--color-sombras',
    '--color-subtitulos',
    '--color-titulos',
    '--color-bordes',
    '--color-sombras-titulos',
    '--color-fondo',
  ];

  const requiredFields = {
    curso: ['idCurso', 'anio'],
    materias: ['idMateria', 'nombre'],
    usuario: [
      'idUsuario',
      'nombre',
      'dni',
      'fechaNac',
      'direccion',
      'telefono',
      'email',
      'password',
      'tipo',
      'curso',
    ],
  };

  useEffect(() => {
    // cargarTablas();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      cargarDatos();
    }
  }, [selectedTable]);

  const tableInfo = {
    usuario: {
      name: 'Usuarios',
    },
    curso: {
      name: 'Cursos',
    },
    materias: {
      name: 'Materias',
    },
    // Agrega más tablas según tus necesidades
  };

  const autoGeneratedColumns = {
    curso: 'idCurso',
    materias: 'idMateria',
    usuario: 'idUsuario',
    // Agrega más tablas según tus necesidades
  };



  const cargarDatos = async () => {
    try {
      const response = await axios.get(`https://app-2361a359-07df-48b8-acfd-5fb4c0536ce2.cleverapps.io/${selectedTable}`);
      const data = response.data;

      setTableData(data);
      setColumns(Object.keys(data[0] || {}));
      setEditedData(data.map((row) => ({ ...row, isEditing: false })));
    } catch (error) {
      console.error(`Error al cargar datos de ${selectedTable}:`, error);
    }
  };

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };

  const handleCellEdit = (e, rowIndex, columnName) => {
    const updatedData = editedData.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, [columnName]: e.target.value };
      }
      return row;
    });
    setEditedData(updatedData);
  };

  const handleDeleteRow = async (rowIndex) => {
    try {
      let idFieldName = '';
      if (selectedTable === 'materias') {
        idFieldName = 'idMateria';
      } else if (selectedTable === 'usuario') {
        idFieldName = 'idUsuario';
      } else if (selectedTable === 'curso') {
        idFieldName = 'idCurso';
      }
      setDeletingRows([...deletingRows, rowIndex]);

      const id = editedData[rowIndex][idFieldName];
      const url = `https://app-2361a359-07df-48b8-acfd-5fb4c0536ce2.cleverapps.io/${selectedTable}/${id}`;
      await axios.delete(url);
      setDeletingRows(deletingRows.filter((index) => index !== rowIndex));
      const updatedData = editedData.filter((row, index) => index !== rowIndex);
      setEditedData(updatedData);
    } catch (error) {
      setDeletingRows(deletingRows.filter((index) => index !== rowIndex));
      console.error('Error al borrar una fila:', error);
    }
  };

  const handleSaveChanges = async (rowIndex) => {
    try {
      const { isEditing, ...updatedRow } = editedData[rowIndex];

      const idFieldName = requiredFields[selectedTable][0]; // El primer campo es el ID
      const id = updatedRow[idFieldName];

      const isDataValid = requiredFields[selectedTable].every(
        (field) => updatedRow[field] !== undefined && updatedRow[field] !== ''
      );

      if (!isDataValid) {
        console.error('Completa todos los campos requeridos.');
        return;
      }

      // Crear un objeto con los campos a actualizar
      const fieldsToUpdate = {};
      for (const field in updatedRow) {
        if (requiredFields[selectedTable].includes(field)) {
          fieldsToUpdate[field] = updatedRow[field];
        }
      }
      setLoading2(true);
      await axios.put(`https://app-2361a359-07df-48b8-acfd-5fb4c0536ce2.cleverapps.io/${selectedTable}/${id}`, fieldsToUpdate);

      const updatedData = [...editedData];
      updatedData[rowIndex] = updatedRow;
      setLoading2(false);
      setEditedData(updatedData);
    } catch (error) {
      setLoading2(false);
      console.error('Error al guardar cambios:', error);
    }
    cargarDatos();
  };



  const handleEditRow = (rowIndex) => {
    const updatedRow = { ...editedData[rowIndex], isEditing: true };
    const updatedData = [...editedData];
    updatedData[rowIndex] = updatedRow;
    setEditedData(updatedData);

  };

  const handleAddRow = async () => {
    try {
      let requiredFields = [];
      if (selectedTable === 'materias') {
        requiredFields = ['nombre'];
      } else if (selectedTable === 'curso') {
        requiredFields = ['anio'];
      } else if (selectedTable === 'usuario') {
        requiredFields = [
          'nombre',
          'dni',
          'fechaNac',
          'direccion',
          'telefono',
          'email',
          'password',
          'tipo',
          'curso',
        ];
      }
      const isDataValid = requiredFields.every((field) => newRowData[field] !== undefined && newRowData[field] !== '');

      if (!isDataValid) {
        console.error('Completa todos los campos requeridos.');
        return;
      }

      setLoading(true);
      // Envía la nueva fila al servidor para su creación
      const response = await axios.post(`https://app-2361a359-07df-48b8-acfd-5fb4c0536ce2.cleverapps.io/${selectedTable}`, newRowData);
      const addedRow = response.data;
      setLoading(false);
      // Agrega la fila completa al estado local
      setEditedData([...editedData, addedRow]);
      setNewRowData({}); // Restablece la nueva fila después de agregarla

      // Después de agregar la fila, puedes recargar los datos nuevamente desde el servidor para asegurarte de que estén actualizados
      cargarDatos(); // Llama a la función que carga los datos nuevamente
    } catch (error) {
      setLoading(false);
      console.error('Error al agregar una nueva fila:', error);
    }
  };



  const handleNewRowInputChange = (e, columnName) => {
    setNewRowData({ ...newRowData, [columnName]: e.target.value });
  };

  const isTableEmpty = tableData.length === 0;


  // function abrirPaleta() {
  //   const colorElegido = prompt("Por favor, introduce un color en formato hexadecimal (#FFFFFF) o de nombre (por ejemplo, 'blue'):");
  
  //   if (colorElegido) {
  //     document.documentElement.style.setProperty('--color-nav-foot', colorElegido);
  //   }
  // }
  
  const handleChangeColor = (variable, nuevoColor) => {
    setColors({ ...colors, [variable]: nuevoColor });
    document.documentElement.style.setProperty(variable, nuevoColor);
  };


  
  const handleGuardarColor = (color, variable) => {
    setLoading(true);
    axios
      .get(`https://app-2361a359-07df-48b8-acfd-5fb4c0536ce2.cleverapps.io/carga/${color}`)
      .then((response) => {
        const data = response.data;
        setLoading(false);
        if (data) {
          console.log('resp',data)
          // Si la referencia ya existe, actualiza el campo 'texto' con el nuevo valor del color
          const referenceToUpdate = data; // Tomamos la primera entrada, ya que debería ser la última
          console.log('aaa',referenceToUpdate)
          // Actualiza la entrada existente con el nuevo valor de 'texto'
          axios
            .put(`https://app-2361a359-07df-48b8-acfd-5fb4c0536ce2.cleverapps.io/carga/${referenceToUpdate.id}`, {
            
              texto: variable,
            })
            .then((response) => {
              console.log('Color actualizado con éxito:', response.data);
              // Aquí puedes manejar la lógica después de actualizar el color si es necesario
            })
            .catch((error) => {
              console.error('Error al actualizar el color:', error);
              // Manejar el error en caso de fallo al actualizar
            });
        } else {
          // Si no hay datos, significa que la referencia no existe y se crea una nueva entrada
          axios
            .post('https://app-2361a359-07df-48b8-acfd-5fb4c0536ce2.cleverapps.io/carga/text', {
              referencia: color,
              texto: variable,
            })
            .then((response) => {
              console.log('Color guardado con éxito:', response.data);
              // Aquí puedes manejar la lógica después de guardar el color si es necesario
            })
            .catch((error) => {
              console.error('Error al guardar el color:', error);
              // Manejar el error en caso de fallo al guardar
            });
        }
      })
      .catch((error) => {
        console.error('Error al verificar la existencia de la referencia:', error);
        // Manejar el error en caso de fallo al verificar la existencia de la referencia
      });
  };
  
  
  
  
  const fetchColorsFromTable = async () => {
    try {
      const colorsData = {};
  
      // Realizar la solicitud para obtener los colores asociados a las referencias
      for (const reference of referencesToFetch) {
        const response = await axios.get(`https://app-2361a359-07df-48b8-acfd-5fb4c0536ce2.cleverapps.io/carga/${reference}`);
        
        colorsData[reference] = response.data.texto || ''; // Valor por defecto si no hay datos
      }
  
      // Establecer los colores en la paleta de colores
      setColors(colorsData);
      Object.entries(colorsData).forEach(([variable, color]) => {
        document.documentElement.style.setProperty(variable, color);
      });
    } catch (error) {
      console.error('Error al obtener los colores de la tabla:', error);
    }
  };
  

  useEffect(() => {
    // Llamar a la función para obtener los colores al cargar la página
    fetchColorsFromTable();
    // ... (otros useEffects)
  }, []);
  
  
  
  return (
<div className="admin-page d-flex flex-column">



  <Solicitudes />
  <div className="mx-auto mt-5 text-center">
    <h4>Editar contenido de tablas</h4>
    <div className="d-flex justify-content-between align-items-center">
          <select
            className="form-select m-3 mx-auto"
            style={{ maxWidth: '200px' }}
            onChange={handleTableChange}
            value={selectedTable}
          >
            <option value="">Seleccionar tabla</option>
            {Object.keys(tableInfo).map((tableName) => (
              <option key={tableName} value={tableName}>
                {tableInfo[tableName].name}
              </option>
            ))}
          </select>

        </div>
        {selectedTable && (
          <div>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  {requiredFields[selectedTable].map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editedData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {requiredFields[selectedTable].map((column) => (
                      <td key={column}>
                        {autoGeneratedColumns[selectedTable] === column ? (
                          row[column]
                        ) : row.isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            value={row[column]}
                            onChange={(e) => handleCellEdit(e, rowIndex, column)}
                          />
                        ) : (
                          row[column]
                        )}
                      </td>
                    ))}

<td>
  {row.isEditing ? (
    <div className="btn-group">
      <button className="btn btn-primary" disabled={loading2} onClick={() => handleSaveChanges(rowIndex)}>
        {loading2 ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          'Guardar'
        )}
      </button>
      <button className="btn btn-danger" disabled={deletingRows.includes(rowIndex)} onClick={() => handleDeleteRow(rowIndex)}>
        {deletingRows.includes(rowIndex) ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          'Borrar'
        )}
      </button>
    </div>
  ) : (
    <div className="btn-group">
      <button className="btn btn-warning" disabled={loading} onClick={() => handleEditRow(rowIndex)}>
        {loading ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          'Editar'
        )}
      </button>
      <button className="btn btn-danger" disabled={deletingRows.includes(rowIndex)} onClick={() => handleDeleteRow(rowIndex)}>
        {deletingRows.includes(rowIndex) ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          'Borrar'
        )}
      </button>
    </div>
  )}
</td>


                  </tr>
                ))}
                {/* Agrega una fila vacía al final para agregar nuevos datos */}
                <tr>
                  {requiredFields[selectedTable].map((field) => (
                    <td key={field}>
                      {autoGeneratedColumns[selectedTable] === field ? (
                        'autocompletado'
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          value={newRowData[field] || ''}
                          onChange={(e) => handleNewRowInputChange(e, field)}
                        />
                      )}
                    </td>
                  ))}
                  <td>
                  <button className="btn btn-success" disabled={loading} onClick={() => handleAddRow()}>
        {loading ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          'Agregar'
        )}
      </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <BloqueDeCarga />
      <SessionExpiration />

      <div className="admin-page mt-5 mx-auto">
      <div className="row">
        <div className="col">
          {loading && (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

      <div className="row">
        <div className="col">
          {Object.entries(colors).map(([variable, color]) => (
            <div key={variable} className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleChangeColor(variable, e.target.value)}
                />
                <label htmlFor={variable} className="ms-2 mb-0">{variable}</label>
              </div>
              <button
                className="btn btn-success ms-2"
                onClick={() => handleGuardarColor(variable, color)}
                disabled={loading} // Deshabilita el botón mientras se está realizando la acción
              >
                Guardar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>  </div>  </div>
  );
};

export default AdminPage;