import React, { useState, useEffect } from 'react';
import './ProfilePage.scss';
import { useNavigate } from 'react-router';
import api from '../../services/api';
import {toast} from 'react-toastify'

interface UserData {
    id: string;
    firstName?: string;
    lastName?: string;
    nombres?: string;
    apellidos?: string;
    email?: string;
    correo?: string;
    age?: number;
    edad?: number;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // modal states
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // edit form state
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Load user data on mount
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const storedUser = localStorage.getItem('user');
            
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                console.log('👤 Usuario desde localStorage:', userData);
                setUser(userData);
                initializeForm(userData);
            } else {
                console.log('🔄 Obteniendo perfil desde API...');
                const response = await api.getProfile();
                
                if (response.success && response.data) {
                    const apiUser = response.data as UserData;
                    console.log('👤 Usuario desde API:', apiUser);
                    setUser(apiUser);
                    initializeForm(apiUser);
                    localStorage.setItem('user', JSON.stringify(apiUser));
                }
            }
        } catch (error) {
            console.error('❌ Error cargando usuario:', error);
            navigate('/inicio-sesion');
        } finally {
            setLoading(false);
        }
    };

    const initializeForm = (userData: UserData) => {
        setName(userData.firstName || userData.nombres || '');
        setLastName(userData.lastName || userData.apellidos || '');
        setEmail(userData.email || userData.correo || '');
        setAge(String(userData.age || userData.edad || ''));
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (editOpen || deleteOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [editOpen, deleteOpen]);

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditOpen(false);
                setDeleteOpen(false);
            }
        };

        if (editOpen || deleteOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [editOpen, deleteOpen]);

    const handleSave = async () => {
        if (newPassword && newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (newPassword && newPassword.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        const ageNum = age === '' ? undefined : Number(age);
        if (age !== '' && (isNaN(ageNum as number) || (ageNum as number) < 18 || (ageNum as number) > 120)) {
            toast.error('Ingresa una edad válida entre 18 y 120');
            return;
        }

        const updateData: any = {
            nombres: name,
            apellidos: lastName,
        } as any;

        if (ageNum !== undefined) updateData.edad = ageNum;
        if (newPassword) updateData.contrasena = newPassword;

        console.log('💾 Guardando cambios (payload):', updateData);

        const prevUser = user;
        const optimisticUser = (prev => ({
            ...(prev ?? {}),
            firstName: name,
            lastName: lastName,
            nombres: name,
            apellidos: lastName,
            ...(ageNum !== undefined ? { age: ageNum, edad: ageNum } : {}),
        }))(user);

        try {
            setUser(optimisticUser as UserData);
            localStorage.setItem('user', JSON.stringify(optimisticUser));

            const response = await api.updateProfile(updateData);

            if (response.success) {
                console.log('✅ Perfil actualizado en servidor:', response.data);

                if (response.data) {
                    const serverUser = response.data as UserData;
                    setUser(serverUser);
                    localStorage.setItem('user', JSON.stringify(serverUser));
                }

                toast.success('Perfil actualizado correctamente');
                setEditOpen(false);

                setNewPassword('');
                setConfirmPassword('');
            } else {
                throw new Error(response.message || response.message_es || 'Error al actualizar');
            }
        } catch (error: any) {
            console.error('❌ Error actualizando perfil:', error);
            setUser(prevUser);
            if (prevUser) localStorage.setItem('user', JSON.stringify(prevUser));
            alert('❌ Error al actualizar el perfil: ' + (error.message || 'Error desconocido'));
        }
    };

    const handleConfirmDelete = async () => {
        try {
            console.log('🗑️ Eliminando cuenta...');
            
            const response = await api.deleteAccount();
            
            if (response.success) {
                console.log('✅ Cuenta eliminada');
                
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                toast.success('Cuenta eliminada exitosamente');
                navigate('/');
            }
        } catch (error: any) {
            console.error('❌ Error eliminando cuenta:', error);
            alert('❌ Error al eliminar la cuenta: ' + (error.message || 'Error desconocido'));
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setEditOpen(false);
            setDeleteOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '50vh'
            }}>
                <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)' }} role="status" aria-live="polite">
                    Cargando perfil...
                </p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-page">
                <p style={{ textAlign: 'center', color: '#ff5252' }} role="alert">
                    ❌ No se pudo cargar el perfil del usuario
                </p>
            </div>
        );
    }

    const displayName = user.firstName || user.nombres || 'Usuario';
    const displayLastName = user.lastName || user.apellidos || '';
    const displayEmail = user.email || user.correo || 'email@example.com';
    const displayAge = user.age || user.edad || 0;
    const fullName = `${displayName} ${displayLastName}`.trim();

    return (
        <>
            <main className="profile-page" role="main">
                <div className="profile-header">
                    <div 
                        className="profile-avatar" 
                        role="img" 
                        
                    >
                        <span className="avatar-icon" aria-hidden="true">
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <h2 className="profile-name" id="profile-title">{fullName}</h2>
                </div>

                <section className="profile-details" >
                    <p><strong>Email:</strong> {displayEmail}</p>
                    <p><strong>Edad:</strong> {displayAge} años</p>
                </section>

                <div className="profile-actions">
                    <button 
                        className="edit-button" 
                        onClick={() => setEditOpen(true)}
                        aria-label="Abrir modal para editar perfil"
                    >
                        Edita tu perfil
                    </button>
                    <button 
                        className="delete-button" 
                        onClick={() => setDeleteOpen(true)}
                        aria-label="Abrir modal para eliminar perfil"
                    >
                        Elimina tu perfil
                    </button>
                </div>
            </main>

            {/* Edit Modal */}
            {editOpen && (
                <div 
                    className="modal-overlay" 
                    onClick={handleOverlayClick}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-modal-title"
                >
                    <div className="modal-card edit-modal">
                        <button 
                            className="modal-close" 
                            onClick={() => setEditOpen(false)}
                            aria-label="Cerrar modal de edición"
                        >
                            ×
                        </button>
                        <h3 id="edit-modal-title">Editar Usuario</h3>
                        <p className="modal-sub">Modifica tu información personal</p>
                        
                        <label htmlFor="name-input" className="visually-hidden">Nombre</label>
                        <input 
                            id="name-input"
                            className="form-input" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Nombre"
                            aria-required="true"
                        />
                        
                        <label htmlFor="lastname-input" className="visually-hidden">Apellido</label>
                        <input 
                            id="lastname-input"
                            className="form-input" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)} 
                            placeholder="Apellido"
                            aria-required="true"
                        />
                        
                        <label htmlFor="email-input" className="visually-hidden">Email</label>
                        <input 
                            id="email-input"
                            className="form-input" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email"
                            type="email"
                            disabled
                            aria-disabled="true"
                            aria-describedby="email-hint"
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                        <span id="email-hint" className="visually-hidden">El email no se puede modificar</span>
                        
                        <label htmlFor="age-input" className="visually-hidden">Edad</label>
                        <input 
                            id="age-input"
                            className="form-input" 
                            value={age} 
                            onChange={(e) => setAge(e.target.value)} 
                            placeholder="Edad"
                            type="number"
                            min="18"
                            max="120"
                            aria-required="true"
                        />
                        
                        <p className="modal-sub" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                            Cambiar contraseña (opcional)
                        </p>
                        
                        <label htmlFor="new-password-input" className="visually-hidden">Nueva Contraseña</label>
                        <input 
                            id="new-password-input"
                            className="form-input" 
                            type="password" 
                            placeholder="Nueva Contraseña (mín. 8 caracteres)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            aria-describedby="password-requirements"
                        />
                        <span id="password-requirements" className="visually-hidden">
                            La contraseña debe tener al menos 8 caracteres
                        </span>
                        
                        <label htmlFor="confirm-password-input" className="visually-hidden">Confirmar Contraseña</label>
                        <input 
                            id="confirm-password-input"
                            className="form-input" 
                            type="password" 
                            placeholder="Confirma Nueva Contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        
                        <div className="modal-actions">
                            <button className="save-button" onClick={handleSave}>
                                Guardar Cambios
                            </button>
                            <button className="cancel-delete" onClick={() => setEditOpen(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteOpen && (
                <div 
                    className="modal-overlay" 
                    onClick={handleOverlayClick}
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="delete-modal-title"
                    aria-describedby="delete-modal-description"
                >
                    <div className="modal-card delete-modal">
                        <button 
                            className="modal-close" 
                            onClick={() => setDeleteOpen(false)}
                            aria-label="Cerrar modal de confirmación"
                        >
                            ×
                        </button>
                        <h3 id="delete-modal-title">Eliminar Usuario</h3>
                        <p id="delete-modal-description">
                            Esta acción eliminará permanentemente tu cuenta y todos tus datos. 
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button 
                                className="confirm-delete" 
                                onClick={handleConfirmDelete}
                                aria-label="Confirmar eliminación de cuenta"
                            >
                                Eliminar
                            </button>
                            <button 
                                className="cancel-delete" 
                                onClick={() => setDeleteOpen(false)}
                                aria-label="Cancelar eliminación"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePage;