import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Avatar, Divider, Tabs, Tab } from '@mui/material';
import api from '../api';
import { updateUser, logout } from '../redux/slices/authSlice';

// Importa apenas os arquivos CSS necessários para o layout
import "./ProfilePage.css"; 
import "./EditProfilePage.css";

const EditProfilePage = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [tab, setTab] = useState(0);

    // Estados dos formulários (sem alterações aqui)
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [twitter, setTwitter] = useState('');
    const [twitch, setTwitch] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setTwitter(user.socials?.twitter || '');
            setTwitch(user.socials?.twitch || '');
            setAvatarPreview(user.avatar ? `https://assrpgsite-be-production.up.railway.app${user.avatar}` : '');
        }
    }, [user]);

    // Funções de handle (sem alterações na lógica)
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('bio', bio);
        formData.append('socials[twitter]', twitter);
        formData.append('socials[twitch]', twitch);
        if (avatar) {
            formData.append('avatar', avatar);
        }
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const { data } = await api.put('/profile', formData, config);
            dispatch(updateUser(data));
            alert('Perfil atualizado com sucesso!');
            navigate('/perfil');
        } catch (error) {
            alert('Erro ao atualizar o perfil.');
        }
    };
    
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return alert('As novas senhas não coincidem.');
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/profile/change-password', { currentPassword, newPassword }, config);
            alert('Senha alterada com sucesso!');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (error) {
            alert('Erro ao alterar a senha. Verifique sua senha atual.');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('TEM CERTEZA? Esta ação é irreversível.')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` }, data: { password: deletePassword } };
                await api.delete('/profile/delete-account', config);
                alert('Conta deletada com sucesso.');
                dispatch(logout());
                navigate('/login');
            } catch (error) {
                alert('Erro ao deletar a conta. Senha incorreta.');
            }
        }
    };

    // Objeto de estilo para os TextFields para evitar repetição
    const textFieldStyles = {
        '& .MuiInputBase-input': { color: '#fff' },
        '& .MuiInputLabel-root': { color: '#a0a0a0' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
        '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
            '&.Mui-focused fieldset': { borderColor: '#fff' },
        },
        mb: 2
    };

    return (
        <Box className="profile-page-container">
            <Paper className="profile-paper" elevation={3}>
                <Typography variant="h4" component="h1" className="profile-title" gutterBottom>
                    Editar Perfil
                </Typography>
                
                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Tabs 
                        value={tab} 
                        onChange={(e, newValue) => setTab(newValue)} 
                        centered
                        textColor="inherit" // Deixa o texto do Tab branco
                        sx={{ '& .MuiTabs-indicator': { backgroundColor: '#fff' } }} // Deixa a linha indicadora branca
                    >
                        <Tab label="Personalizar Perfil" sx={{ color: '#fff' }} />
                        <Tab label="Gerenciamento da Conta" sx={{ color: '#fff' }} />
                    </Tabs>
                </Box>

                {/* Aba de Personalização */}
                {tab === 0 && (
                    <Box component="form" onSubmit={handleProfileSubmit} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                            <Avatar src={avatarPreview} sx={{ width: 80, height: 80 }} />
                            <Button variant="outlined" component="label" sx={{ color: '#fff', borderColor: '#fff' }}>
                                Trocar Avatar
                                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                            </Button>
                        </Box>
                        <TextField fullWidth label="Nome" value={name} onChange={(e) => setName(e.target.value)} sx={textFieldStyles} />
                        <TextField fullWidth multiline rows={3} label="Biografia" value={bio} onChange={(e) => setBio(e.target.value)} sx={textFieldStyles} />
                        <TextField fullWidth label="Twitter (URL)" value={twitter} onChange={(e) => setTwitter(e.target.value)} sx={textFieldStyles} />
                        <TextField fullWidth label="Twitch (URL)" value={twitch} onChange={(e) => setTwitch(e.target.value)} sx={textFieldStyles} />
                        <Button type="submit" variant="contained" color="primary">Salvar Alterações</Button>
                    </Box>
                )}

                {/* Aba de Gerenciamento */}
                {tab === 1 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6">Alterar Senha</Typography>
                        <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mb: 4, mt: 2 }}>
                            <TextField type="password" fullWidth label="Senha Atual" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} sx={textFieldStyles} />
                            <TextField type="password" fullWidth label="Nova Senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} sx={textFieldStyles} />
                            <TextField type="password" fullWidth label="Confirmar Nova Senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} sx={textFieldStyles} />
                            <Button type="submit" variant="contained">Alterar Senha</Button>
                        </Box>
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                        <Box className="danger-zone">
                            <Typography variant="h6" className="danger-zone-title">Zona de Perigo</Typography>
                            <Typography>Para deletar sua conta, digite sua senha e clique no botão. Esta ação não pode ser desfeita.</Typography>
                            <TextField type="password" fullWidth label="Sua Senha" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} sx={{...textFieldStyles, my: 2}} />
                            <Button variant="contained" color="error" onClick={handleDeleteAccount}>Deletar Minha Conta</Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default EditProfilePage;