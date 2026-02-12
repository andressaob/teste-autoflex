import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { ProductionSuggestion } from '../types';

/**
 * Page Component for Production Planning.
 * Displays the suggested production plan based on current inventory.
 * Utilizes the backend's "Greedy" algorithm results.
 */
export const ProductionPage: React.FC = () => {
    const [suggestion, setSuggestion] = useState<ProductionSuggestion | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Fetches the production suggestion from the API.
     */
    const fetchSuggestion = async () => {
        setLoading(true);
        try {
            const response = await api.get<ProductionSuggestion>('/production/suggestion');
            setSuggestion(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Load suggestion on component mount
    useEffect(() => {
        fetchSuggestion();
    }, []);

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Plano de Produção</h1>
                <button onClick={fetchSuggestion} className="btn btn-primary">Atualizar Plano</button>
            </div>

            {/* Educational Info - Styled as a clean card to match app theme */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: '#555' }}>💡 Como funciona o cálculo?</h3>
                <p style={{ margin: '0 0 10px 0', color: '#666', lineHeight: '1.5' }}>
                    O sistema utiliza uma estratégia de <strong>maximização de valor</strong>. 
                    Ele verifica seu estoque atual e prioriza a fabricação dos produtos mais caros para aumentar o faturamento.
                </p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Resultado da Análise</h3>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: '#666', marginRight: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Faturamento Estimado</span>
                        <span style={{ fontSize: '1.4rem', color: '#198754', fontWeight: 'bold' }}>R$ {suggestion?.totalValue?.toFixed(2) ?? '0.00'}</span>
                    </div>
                </div>

                {loading ? (
                    <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                        <p>Calculando a melhor produção...</p>
                    </div>
                ) : (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Produto</th>
                                <th>Qtd. Sugerida</th>
                                <th style={{textAlign: 'right'}}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestion?.items?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        Nenhuma produção possível com o estoque atual.
                                    </td>
                                </tr>
                            ) : (
                                suggestion?.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.productCode}</td>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td style={{textAlign: 'right', fontWeight: 500}}>
                                            R$ {item.subtotal.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
