import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './admin.css';

const AdminPage = () => {
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [newRowData, setNewRowData] = useState({});
  const [sessionExpired, setSessionExpired] = useState(false);
  const [columns, setColumns] = useState([]);

  const requiredFields = {
    curso: ['idCurso', 'anio'],
    materias: ['idMateria', 'nombre'],
    usuario: [
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

  const cargarDatos = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/${selectedTable}`);
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
      const idFieldName = selectedTable === 'materias' ? 'idMateria' : 'idCurso';
      const id = editedData[rowIndex][idFieldName];
      const url = `http://localhost:3000/${selectedTable}/${id}`;
      await axios.delete(url);

      const updatedData = editedData.filter((row, index) => index !== rowIndex);
      setEditedData(updatedData);
    } catch (error) {
      console.error('Error al borrar una fila:', error);
    }
  };

  const handleSaveChanges = async (rowIndex) => {
    try {
      const { isEditing, ...updatedRow } = editedData[rowIndex];
      const idFieldName = selectedTable === 'materias' ? 'idMateria' : 'idCurso';
      const id = updatedRow[idFieldName];

      const isDataValid = requiredFields[selectedTable].every(
        (field) => updatedRow[field] !== undefined && updatedRow[field] !== ''
      );

      if (!isDataValid) {
        console.error('Completa todos los campos requeridos.');
        return;
      }

      const response = await axios.put(
        `http://localhost:3000/${selectedTable}/${id}`,
        updatedRow
      );

      const updatedData = [...editedData];
      updatedData[rowIndex] = response.data;
      setEditedData(updatedData);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  };

  const handleEditRow = (rowIndex) => {
    const updatedRow = { ...editedData[rowIndex], isEditing: true };
    const updatedData = [...editedData];
    updatedData[rowIndex] = updatedRow;
    setEditedData(updatedData);
  };

  const handleAddRow = async () => {
    try {
      const isDataValid = requiredFields[selectedTable].every(
        (field) => newRowData[field] !== undefined && newRowData[field] !== ''
      );

      if (!isDataValid) {
        console.error('Completa todos los campos requeridos.');
        return;
      }

      const response = await axios.post(
        `http://localhost:3000/${selectedTable}`,
        newRowData
      );

      setEditedData([...editedData, response.data]);
      setNewRowData({});
      console.log('Nueva fila agregada con éxito.');
    } catch (error) {
      console.error('Error al agregar una nueva fila:', error);
    }
  };

  const handleNewRowInputChange = (e, columnName) => {
    setNewRowData({ ...newRowData, [columnName]: e.target.value });
  };

  const isTableEmpty = tableData.length === 0;

  return (
    <div className="admin-page d-flex flex-column">
      {sessionExpired ? (
        <div className="alert alert-danger">
          Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center">
            <select
              className="form-select m-3"
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
            {selectedTable && (
              <h2>Tabla {tableInfo[selectedTable].name}</h2>
            )}
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
                          {row.isEditing ? (
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
                            <button className="btn btn-primary" onClick={() => handleSaveChanges(rowIndex)}>Guardar</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteRow(rowIndex)}>Borrar</button>
                          </div>
                        ) : (
                          <div className="btn-group">
                            <button className="btn btn-warning" onClick={() => handleEditRow(rowIndex)}>Editar</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteRow(rowIndex)}>Borrar</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                    {isTableEmpty && (
                    <tr>
                      {requiredFields[selectedTable].map((field) => (
                        <td key={field}>
                          <input
                            type="text"
                            className="form-control"
                            value={newRowData[field] || ''}
                            onChange={(e) => handleNewRowInputChange(e, field)}
                          />
                        </td>
                      ))}
                      <td>
                        <button className="btn btn-success" onClick={handleAddRow}>Agregar</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
