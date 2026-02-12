import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchProducts, createProduct, deleteProduct, addRawMaterialToProduct } from '../store/productSlice';
import { fetchRawMaterials } from '../store/rawMaterialSlice';
import api from '../api/axiosInstance';
import { Modal } from '../components/common/Modal';

/**
 * Page responsible for managing the Product catalog.
 * 
 * Features:
 * - List all registered products.
 * - Create new products with their initial Bill of Materials (Raw Materials composition).
 * - Edit existing product composition (add/remove/update quantity of raw materials).
 * - Delete products.
 * 
 * This component handles complex state for two distinct "Edit" contexts:
 * 1. Building a list of materials for a *new* product (local state only).
 * 2. Editing the list of materials for an *existing* product (direct API calls).
 */
export const ProductsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: products, loading: pLoading, error: pError } = useSelector((state: RootState) => state.products);
    const { items: rawMaterials } = useSelector((state: RootState) => state.rawMaterials);
    
    // --- State: Selection & Modals ---
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Derived state for the currently selected product (for the Edit/Details modal)
    const selectedProduct = products.find(p => p.id === selectedProductId);

    // --- State: Form - Create Product ---
    // These hold values for the "New Product" modal
    const [pCode, setPCode] = useState('');
    const [pName, setPName] = useState('');
    const [pValue, setPValue] = useState(0);
    // Holds the temporary composition list before the product is actually created
    const [newProductMaterials, setNewProductMaterials] = useState<Array<{rawMaterialId: number, quantity: number}>>([]);

    // --- State: Inline Editing (Create Modal) ---
    // Tracks which item is being edited in the "New Product" material list
    const [editingMatIndex, setEditingMatIndex] = useState<number | null>(null);
    const [editingQty, setEditingQty] = useState<number>(0);

    // --- State: Inline Editing (Edit Modal - Existing Product) ---
    // Tracks which real backend relationship is being edited
    const [editExistingMatId, setEditExistingMatId] = useState<number | null>(null);
    const [editExistingQty, setEditExistingQty] = useState<number>(0);

    // --- State: Shared Form Inputs ---
    // Used for selecting a material to add in both modals (Create/Edit)
    const [rmId, setRmId] = useState<number>(0);
    const [rmQty, setRmQty] = useState(0);

    // Perform initial data fetch
    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchRawMaterials());
    }, [dispatch]);

    // Automatically select the first available raw material in the dropdown when the list loads
    useEffect(() => {
        if (rawMaterials.length > 0 && rmId === 0) {
            setRmId(rawMaterials[0].id);
        }
    }, [rawMaterials, rmId]);

    /**
     * Adds a material to the *temporary* list of the new product being created.
     * Does not make API calls yet.
     */
    const handleAddMaterialToNewProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (rmQty <= 0) return;

        const exists = newProductMaterials.some(m => m.rawMaterialId === rmId);
        if (exists) {
            alert("A matéria prima selecionada já está associada ao produto. Para alterar a quantidade, clique no botão respectivo");
            return;
        }

        setNewProductMaterials([...newProductMaterials, { rawMaterialId: rmId, quantity: rmQty }]);
        setRmQty(0);
    };

    /**
     * Removes a material from the *temporary* list.
     */
    const handleRemoveMaterialFromNewProduct = (index: number) => {
        const updated = [...newProductMaterials];
        updated.splice(index, 1);
        setNewProductMaterials(updated);
    };

    /**
     * Enters "Edit Mode" for a specific item in the temporary list.
     */
    const startEditingMaterial = (index: number, quantity: number) => {
        setEditingMatIndex(index);
        setEditingQty(quantity);
    };

    /**
     * Saves changes made to a quantity in the temporary list.
     */
    const saveEditingMaterial = (index: number) => {
        const updated = [...newProductMaterials];
        updated[index].quantity = editingQty;
        setNewProductMaterials(updated);
        setEditingMatIndex(null);
    };

    /**
     * Orchestrates the creation of a full Product entity.
     * Since the backend API separates Product creation from defining its composition,
     * this function:
     * 1. Creates the base Product.
     * 2. Iterates through the temporary `newProductMaterials` list.
     * 3. Makes sequential API calls to associate each material with the new ID.
     */
    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        // 1. Create Product
        const resultAction = await dispatch(createProduct({ code: pCode, name: pName, value: pValue }));
        
        if (createProduct.fulfilled.match(resultAction)) {
            const newProduct = resultAction.payload;
            
            // 2. Add Materials (Sequential execution to ensure order/stability)
            if (newProductMaterials.length > 0) {
                for (const mat of newProductMaterials) {
                    await dispatch(addRawMaterialToProduct({
                        productId: newProduct.id,
                        rawMaterialId: mat.rawMaterialId,
                        quantity: mat.quantity
                    }));
                }
            }

            // Reset Form and Close
            setPCode(''); setPName(''); setPValue(0);
            setNewProductMaterials([]);
            setIsCreateModalOpen(false);
            dispatch(fetchProducts()); // Ensure global store is fresh
        }
    };

    /**
     * Adds a material to an *existing* product (Live API call).
     */
    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !selectedProduct) return;

        // Check for duplicates in the already loaded product data
        const exists = selectedProduct.rawMaterials?.some(m => m.rawMaterialId === rmId);
        if (exists) {
            alert("A matéria prima selecionada já está associada ao produto. Para alterar a quantidade, utilize o botão de edição na lista acima.");
            return;
        }
        
        await dispatch(addRawMaterialToProduct({ 
            productId: selectedProductId, 
            rawMaterialId: rmId, 
            quantity: rmQty 
        }));
        
        dispatch(fetchProducts()); // Refresh UI
        setRmQty(0);
    };

    /**
     * Enters "Edit Mode" for an existing relationship in the backend.
     */
    const startEditingExistingMaterial = (rawMaterialId: number, currentQty: number) => {
        setEditExistingMatId(rawMaterialId);
        setEditExistingQty(currentQty);
    };

    /**
     * Saves the updated quantity for an existing relationship directly to the backend.
     */
    const saveEditingExistingMaterial = async (rawMaterialId: number) => {
        if (!selectedProductId) return;

        // Re-using 'addRawMaterialToProduct' which acts as an Upsert (Update if exists)
        await dispatch(addRawMaterialToProduct({
            productId: selectedProductId,
            rawMaterialId: rawMaterialId,
            quantity: editExistingQty
        }));

        setEditExistingMatId(null);
        dispatch(fetchProducts());
    };

    /**
     * Deletes a product after confirmation.
     */
    const handleDeleteProduct = (id: number) => {
        if (window.confirm('Excluir produto?')) {
            dispatch(deleteProduct(id));
            if (selectedProductId === id) setSelectedProductId(null);
        }
    };

    /**
     * Removes a material association from a product.
     */
    const handleRemoveMaterial = async (productId: number, rawMaterialId: number) => {
        if (window.confirm('Remover material do produto?')) {
             await api.delete(`/products/${productId}/raw-materials/${rawMaterialId}`);
             dispatch(fetchProducts());
        }
    };

    const closeEditModal = () => {
        setSelectedProductId(null);
        setRmQty(0);
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Produtos</h1>
                <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    + Novo Produto
                </button>
            </div>
            
            <div className="card">
                <h3>Lista de Produtos</h3>
                {pError && <p style={{color: 'red'}}>Erro: {pError}</p>}
                {pLoading ? <p>Carregando...</p> : (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr>
                                <th style={{borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px'}}>Código</th>
                                <th style={{borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px'}}>Nome</th>
                                <th style={{borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px'}}>Valor</th>
                                <th style={{borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px'}}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} 
                                    style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    onClick={() => setSelectedProductId(p.id)}
                                >
                                    <td style={{padding: '12px 8px'}}>{p.code}</td>
                                    <td style={{padding: '12px 8px'}}>{p.name}</td>
                                    <td style={{padding: '12px 8px'}}>R$ {p.value.toFixed(2)}</td>
                                    <td style={{padding: '12px 8px'}}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedProductId(p.id); }} 
                                            className="btn btn-secondary" 
                                            style={{ fontSize: '0.8rem', padding: '4px 8px', marginRight: '5px' }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }} 
                                            className="btn btn-danger" 
                                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal: Create Product */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Criar Novo Produto"
            >
                <div style={{ display: 'flex', gap: '30px' }}>
                    {/* Left: Product Info */}
                    <div style={{ flex: 1 }}>
                        <form id="create-product-form" onSubmit={handleCreateProduct}>
                            <div className="form-group">
                                <label>Código do Produto</label>
                                <input placeholder="Ex: PROD-123" className="form-control" value={pCode} onChange={e => setPCode(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Nome do Produto</label>
                                <input placeholder="Ex: Cadeira de Escritório" className="form-control" value={pName} onChange={e => setPName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Valor de Venda (R$)</label>
                                <input placeholder="0.00" type="number" step="0.01" className="form-control" value={pValue} onChange={e => setPValue(parseFloat(e.target.value))} required />
                            </div>
                        </form>
                    </div>

                    {/* Right: Materials */}
                    <div style={{ flex: 1 }} className="materials-panel">
                        <label style={{display: 'block', marginBottom: '10px', fontWeight: 600}}>Matérias-primas</label>
                        <div className="mt-list-container">
                             {newProductMaterials.length === 0 ? 
                                <div className="mt-list-empty">Nenhum material adicionado.</div> : 
                                (
                                    <div>
                                        {newProductMaterials.map((npm, idx) => {
                                            const rm = rawMaterials.find(r => r.id === npm.rawMaterialId);
                                            const isEditing = editingMatIndex === idx;

                                            return (
                                                <div key={idx} className="mt-list-item">
                                                    <div style={{flex: 1}}>
                                                        <strong>{rm ? rm.name : 'Unknown'}</strong>
                                                        <div style={{fontSize: '0.85rem', color: '#666', marginTop: '4px'}}>
                                                            {isEditing ? (
                                                                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                                    <label style={{margin:0}}>Qtd:</label>
                                                                    <input 
                                                                        type="number" 
                                                                        step="0.0001" 
                                                                        value={editingQty} 
                                                                        onChange={e => setEditingQty(parseFloat(e.target.value))}
                                                                        style={{width: '80px', padding: '2px 5px', borderRadius: '4px', border: '1px solid #ddd'}}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span>Qtd: {npm.quantity}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div style={{display: 'flex', gap: '5px'}}>
                                                        {isEditing ? (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => saveEditingMaterial(idx)} 
                                                                style={{ color: '#198754', border: '1px solid #198754', borderRadius:'4px', background: 'white', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                            >
                                                                Salvar
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => startEditingMaterial(idx, npm.quantity)} 
                                                                style={{ color: '#0d6efd', border: '1px solid #0d6efd', borderRadius:'4px', background: 'white', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                            >
                                                                Editar
                                                            </button>
                                                        )}

                                                        <button 
                                                            type="button" 
                                                            onClick={() => isEditing ? setEditingMatIndex(null) : handleRemoveMaterialFromNewProduct(idx)} 
                                                            style={{ color: '#dc3545', border: '1px solid #dc3545', borderRadius:'4px', background: 'white', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            {isEditing ? 'Cancelar' : 'Excluir'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                             )}
                        </div>
                        
                        <div className="mt-add-box">
                            <div className="form-group" style={{marginBottom: '10px'}}>
                                <label style={{fontSize: '0.9rem'}}>Adicionar Matéria-prima</label>
                                <select 
                                    className="form-control"
                                    value={rmId} 
                                    onChange={e => setRmId(Number(e.target.value))}
                                >
                                    {rawMaterials.map(rm => (
                                        <option key={rm.id} value={rm.id}>
                                            {rm.name} ({rm.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '0.85rem', marginBottom: '4px', display:'block'}}>Quantidade</label>
                                    <input type="number" step="0.0001" className="form-control" value={rmQty} onChange={e => setRmQty(parseFloat(e.target.value))} />
                                </div>
                                <button type="button" className="btn btn-success" onClick={handleAddMaterialToNewProduct} style={{height: '42px', display:'flex', alignItems: 'center'}}>+ Adicionar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ marginTop: '20px', margin: '0 -24px -24px -24px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
                    <button type="submit" form="create-product-form" className="btn btn-primary">Criar Produto</button>
                </div>
            </Modal>

            {/* Modal: Edit Product / Details */}
            <Modal
                isOpen={!!selectedProduct}
                onClose={closeEditModal}
                title={selectedProduct ? `Editando: ${selectedProduct.name}` : ''}
            >
                {selectedProduct && (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <h4>Detalhes</h4>
                            <p><strong>Código:</strong> {selectedProduct.code}</p>
                            <p><strong>Nome:</strong> {selectedProduct.name}</p>
                            <p><strong>Valor:</strong> R$ {selectedProduct.value.toFixed(2)}</p>
                            {/* Note: Update fields could be added here if full edit is needed, currently just viewing details and editing materials */}
                        </div>

                        <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #eee'}} />
                        
                        <h4>Composição (Matérias-primas)</h4>
                        <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                            {selectedProduct.rawMaterials && selectedProduct.rawMaterials.length > 0 ? (
                                <div className="mt-list-container" style={{maxHeight:'none'}}>
                                    {selectedProduct.rawMaterials.map(rm => {
                                        const isEditing = editExistingMatId === rm.rawMaterialId;
                                        return (
                                            <div key={rm.rawMaterialId} className="mt-list-item">
                                                <div style={{flex: 1}}>
                                                    <strong>{rm.rawMaterialName}</strong>
                                                    <div style={{fontSize: '0.85rem', color: '#666', marginTop: '4px'}}>
                                                        {isEditing ? (
                                                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                                <label style={{margin:0}}>Qtd:</label>
                                                                <input 
                                                                    type="number" 
                                                                    step="0.0001" 
                                                                    value={editExistingQty} 
                                                                    onChange={e => setEditExistingQty(parseFloat(e.target.value))}
                                                                    style={{width: '80px', padding: '2px 5px', borderRadius: '4px', border: '1px solid #ddd'}}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span>Qtd: {rm.quantity}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div style={{display: 'flex', gap: '5px'}}>
                                                    {isEditing ? (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => saveEditingExistingMaterial(rm.rawMaterialId)} 
                                                            style={{ color: '#198754', border: '1px solid #198754', borderRadius:'4px', background: 'white', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            Salvar
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => startEditingExistingMaterial(rm.rawMaterialId, rm.quantity)} 
                                                            style={{ color: '#0d6efd', border: '1px solid #0d6efd', borderRadius:'4px', background: 'white', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            Editar
                                                        </button>
                                                    )}

                                                    <button 
                                                        type="button" 
                                                        onClick={() => isEditing ? setEditExistingMatId(null) : handleRemoveMaterial(selectedProduct.id, rm.rawMaterialId)} 
                                                        style={{ color: '#dc3545', border: '1px solid #dc3545', borderRadius:'4px', background: 'white', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        {isEditing ? 'Cancelar' : 'Excluir'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p style={{ margin: 0, color: '#666' }}>Nenhuma matéria-prima vinculada.</p>}
                        </div>

                        <h4>Adicionar Matéria-prima</h4>
                        <form onSubmit={handleAddMaterial} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
                            <div className="form-group">
                                <label>Material</label>
                                <select 
                                    className="form-control"
                                    value={rmId} 
                                    onChange={e => setRmId(Number(e.target.value))}
                                >
                                    {rawMaterials.map(rm => (
                                        <option key={rm.id} value={rm.id}>
                                            {rm.name} ({rm.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantidade Necessária</label>
                                <input type="number" step="0.0001" className="form-control" value={rmQty} onChange={e => setRmQty(parseFloat(e.target.value))} required />
                            </div>
                            <button type="submit" className="btn btn-success" style={{ width: '100%' }}>Adicionar Associação</button>
                        </form>
                    </>
                )}
            </Modal>
        </div>
    );
};
