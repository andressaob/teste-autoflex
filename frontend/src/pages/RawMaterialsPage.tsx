import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchRawMaterials, createRawMaterial, deleteRawMaterial } from '../store/rawMaterialSlice';

/**
 * Page Component for Managing Raw Materials.
 * Allows viewing (list), creating, and deleting raw materials.
 */
export const RawMaterialsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading } = useSelector((state: RootState) => state.rawMaterials);
    
    // Form state
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [stockQuantity, setStockQuantity] = useState(0);

    // Initial fetch
    useEffect(() => {
        dispatch(fetchRawMaterials());
    }, [dispatch]);

    /**
     * Handles the creation of a new Raw Material.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(createRawMaterial({ id: 0, code, name, stockQuantity })); // ID ignored by backend on create
        setCode('');
        setName('');
        setStockQuantity(0);
    };

    /**
     * Handles the deletion of a Raw Material.
     * @param id The ID of the material to delete.
     */
    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza?')) {
            dispatch(deleteRawMaterial(id));
        }
    };

    return (
        <div className="container">
            <h1>Matérias-primas</h1>
            
            <div className="card">
                <h3>Adicionar Nova Matéria-prima</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                    <div>
                        <label>Código</label>
                        <input className="form-control" value={code} onChange={e => setCode(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                        <label>Nome</label>
                        <input className="form-control" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                        <label>Qtd em Estoque</label>
                        <input type="number" step="0.0001" className="form-control" value={stockQuantity} onChange={e => setStockQuantity(parseFloat(e.target.value))} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Adicionar</button>
                </form>
            </div>

            <div className="card">
                {loading ? <p>Carregando...</p> : (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr>
                                <th style={{borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px'}}>Código</th>
                                <th style={{borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px'}}>Nome</th>
                                <th style={{borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px'}}>Estoque</th>
                                <th style={{borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px'}}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td style={{borderBottom: '1px solid #ddd', padding: '8px'}}>{item.code}</td>
                                    <td style={{borderBottom: '1px solid #ddd', padding: '8px'}}>{item.name}</td>
                                    <td style={{borderBottom: '1px solid #ddd', padding: '8px'}}>{item.stockQuantity}</td>
                                    <td style={{borderBottom: '1px solid #ddd', padding: '8px'}}>
                                        <button onClick={() => handleDelete(item.id)} className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
