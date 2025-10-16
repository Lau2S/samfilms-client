import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
import './ProfilePage.scss';
import api from '../../services/api';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // UI state for modals and edit fields
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editAge, setEditAge] = useState('');

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

        const loadProfile = async () => {
        try {
            const result = await api.getProfile();
            if (result && result.success && result.data) {
                // Normalize fields so the UI can read consistently
                const u: any = result.data as any;
                const normalized = {
                    name: u.nombres ?? u.name ?? `${u.nombres || ''} ${u.apellidos || ''}`.trim(),
                    email: u.correo ?? u.email ?? u.usuario ?? '',
                    age: u.edad ?? u.age ?? '',
                    raw: u,
                };
                setUser(normalized);
                setEditName(normalized.name || '');
                setEditEmail(normalized.email || '');
                setEditAge(String(normalized.age ?? ''));
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Map back to API expected fields (adjust as your backend expects)
            // API typing for updateProfile expects nombres/apellidos/edad; some backends accept correo too.
            // Use `any` to avoid a strict typing mismatch and send the desired payload.
            await (api as any).updateProfile({ nombres: editName, correo: editEmail, edad: Number(editAge) } as any);
            alert('Perfil actualizado');
            setEditOpen(false);
            await loadProfile();
        } catch (error: any) {
            alert(error?.message || 'Error al actualizar');
        }
    };

    const handleConfirmDelete = async () => {
        // Aquí iría la lógica para eliminar la cuenta (llamada al backend)
        try {
            // If your API exposes a deleteAccount method, call it. Otherwise adapt accordingly.
            await api.deleteAccount?.();
        } catch (err) {
            console.warn('Error al eliminar cuenta:', err);
        }
        // limpiar token y redirigir al home
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) {
        return <div className="profile-page">Cargando perfil…</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    <span className="avatar-icon">👤</span>
                </div>
                <h2 className="profile-name">{user?.name ?? 'Usuario'}</h2>
            </div>

            <div className="profile-details">
                <p>
                    <strong>Email:</strong> {user?.email ?? '-'}
                </p>
                <p>
                    <strong>Edad:</strong> {user?.age ?? '-'}
                </p>
            </div>

            <div className="profile-actions">
                <button className="edit-button" onClick={() => setEditOpen(true)}>
                    Edita tu perfil
                </button>
                <button className="delete-button" onClick={() => setDeleteOpen(true)}>
                    Elimina tu perfil
                </button>
            </div>

            {/* Edit Modal */}
            {editOpen && (
                <div className="modal-overlay">
                    <div className="modal-card edit-modal">
                        <button className="modal-close" onClick={() => setEditOpen(false)}>
                            x
                        </button>
                        <h3>Editar Usuario</h3>
                        <p className="modal-sub">Deja en blanco para mantener tu contraseña actual</p>
                        <input className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nombre" />
                        <input className="form-input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" />
                        <input className="form-input" value={editAge} onChange={(e) => setEditAge(e.target.value)} placeholder="Edad" />
                        <input className="form-input" type="password" placeholder="Ingresa tu nueva Contraseña" />
                        <input className="form-input" type="password" placeholder="Confirma tu nueva Contraseña" />
                        <div className="modal-actions">
                            <button className="save-button" onClick={handleSave}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteOpen && (
                <div className="modal-overlay">
                    <div className="modal-card delete-modal">
                        <button className="modal-close" onClick={() => setDeleteOpen(false)}>
                            x
                        </button>
                        <h3>Eliminar Usuario</h3>
                        <p>Esta acción eliminará permanentemente tu cuenta</p>
                        <div className="modal-actions">
                            <button className="confirm-delete" onClick={handleConfirmDelete}>
                                Eliminar
                            </button>
                            <button className="cancel-delete" onClick={() => setDeleteOpen(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
