'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Pessoa = {
  id: number;
  nome: string;
  nivel: number;
  mensalista?: boolean;
};

export default function NiveisPage() {
  const [nome, setNome] = useState('');
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGarridoDialogOpen, setIsGarridoDialogOpen] = useState(false);
  const [isGutaoDialogOpen, setIsGutaoDialogOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');

  const router = useRouter();

  const normalize = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  useEffect(() => {
    const storedPessoas = localStorage.getItem('pessoas');
    if (storedPessoas) {
      setPessoas(JSON.parse(storedPessoas));
    }
  }, []);

  const adicionarPessoa = (nomeParaAdicionar: string, aplicarGradient = false) => {
    const nomeLower = nomeParaAdicionar.toLowerCase();
    const novaPessoa: Pessoa = {
      id: Date.now(),
      nome: nomeParaAdicionar,
      nivel: nomeLower === 'goleiro' ? 0 : nomeLower === 'garrido' ? 1 : 3,
      mensalista: false,
    };

    // marcar se deve aplicar gradiente rainbow (Gutão apenas)
    if (aplicarGradient) {
      novaPessoa.nome = nomeParaAdicionar; // já está correto
    }

    const novaLista = [...pessoas, novaPessoa];
    setPessoas(novaLista);
    localStorage.setItem('pessoas', JSON.stringify(novaLista));
    setNome('');
  };

  const handleAddPessoa = () => {
    if (nome.trim() === '') return;

    const nomeNormalized = normalize(nome);

    if (nomeNormalized === 'garrido') {
      setNovoNome(nome);
      setIsGarridoDialogOpen(true);
      return;
    }

    if (nomeNormalized === 'augusto') {
      setNovoNome(nome);
      setIsGutaoDialogOpen(true);
      return;
    }

    if (nomeNormalized === 'gutao') {
      // adiciona como "Gutão" com gradiente rainbow
      adicionarPessoa('Gutão', true);
      return;
    }

    adicionarPessoa(nome); // nomes normais
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleChangeNivel = (nivel: number) => {
    if (selectedId !== null) {
      const pessoa = pessoas.find((p) => p.id === selectedId);
      if (pessoa?.nome.toLowerCase() === 'garrido') {
        handleCloseMenu();
        return;
      }

      const novaLista = pessoas.map((p) => (p.id === selectedId ? { ...p, nivel } : p));
      setPessoas(novaLista);
      localStorage.setItem('pessoas', JSON.stringify(novaLista));
      handleCloseMenu();
    }
  };

  const handleDeletePessoa = (id: number) => {
    const novaLista = pessoas.filter((p) => p.id !== id);
    setPessoas(novaLista);
    localStorage.setItem('pessoas', JSON.stringify(novaLista));
  };

  const handleClearList = () => {
    localStorage.removeItem('pessoas');
    localStorage.removeItem('numTimes');
    setPessoas([]);
    setIsDialogOpen(false);
  };

  const handleAvancar = () => {
    localStorage.setItem('pessoas', JSON.stringify(pessoas));
    router.push('/times');
  };

  const getNivelStyle = (nivel: number, nome: string) => {
    const nomeLower = nome.toLowerCase();
    if (nomeLower === 'garrido') {
      return { color: 'rainbow', estrelas: '🌟' };
    }

    switch (nivel) {
      case 0:
        return { color: 'blue', estrelas: '🧤' };
      case 5:
        return { color: 'green', estrelas: '🌟🌟🌟🌟🌟' };
      case 4:
        return { color: 'limegreen', estrelas: '🌟🌟🌟🌟' };
      case 3:
        return { color: 'orange', estrelas: '🌟🌟🌟' };
      case 2:
        return { color: 'orangered', estrelas: '🌟🌟' };
      case 1:
        return { color: 'red', estrelas: '🌟' };
      default:
        return { color: 'gray', estrelas: '' };
    }
  };

  const toggleMensalista = (id: number) => {
    const novaLista = pessoas.map((p) => (p.id === id ? { ...p, mensalista: !p.mensalista } : p));
    setPessoas(novaLista);
    localStorage.setItem('pessoas', JSON.stringify(novaLista));
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Typography variant="h5" textAlign="center">
        Lista de Pessoas 📋
      </Typography>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddPessoa();
        }}
      >
        <TextField
          label="Nome"
          fullWidth
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          sx={{ mb: 2, mt: 2 }}
        />
        <Button fullWidth type="submit" variant="contained" color="success">
          Adicionar
        </Button>
      </form>

      {pessoas.length >= 8 ? (
        <Fade in={pessoas.length >= 8}>
          <Button
            fullWidth
            onClick={() => setIsDialogOpen(true)}
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
          >
            Limpar Lista
          </Button>
        </Fade>
      ) : (
        <Typography sx={{ mt: 2 }} textAlign="center">
          Insira ao menos 8 pessoas na lista
        </Typography>
      )}

      <Typography sx={{ mt: 2 }} textAlign="center">
        Total de pessoas na lista: {pessoas.length}
      </Typography>

      <List sx={{ maxHeight: { xs: '45vh', sm: '55vh', md: '65vh' }, overflowY: 'auto' }}>
        {pessoas.map((pessoa) => {
          const { color, estrelas } = getNivelStyle(pessoa.nivel, pessoa.nome);
          return (
            <ListItem
              key={pessoa.id}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => toggleMensalista(pessoa.id)} edge="end">
                    {pessoa.mensalista ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>

                  {pessoa.nome.toLowerCase() !== 'garrido' && (
                    <IconButton onClick={(e) => handleOpenMenu(e, pessoa.id)} edge="end">
                      <MoreVertIcon />
                    </IconButton>
                  )}

                  <IconButton
                    onClick={() => handleDeletePessoa(pessoa.id)}
                    edge="end"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={
                  <Typography
                    component="span"
                    sx={{
                      display: 'inline-block', // necessário para o background cobrir o texto
                      background:
                        pessoa.nome.toLowerCase() === 'gutão'
                          ? 'linear-gradient(to right, #e40303, #ff8c00, #ffed00, #008026, #004dff, #750787)'
                          : 'none',
                      WebkitBackgroundClip:
                        pessoa.nome.toLowerCase() === 'gutão' ? 'text' : 'initial',
                      WebkitTextFillColor:
                        pessoa.nome.toLowerCase() === 'gutão' ? 'transparent' : 'initial',
                      fontWeight: pessoa.nome.toLowerCase() === 'gutão' ? 'bold' : 'normal',
                    }}
                  >
                    {pessoa.nome}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color }}>
                    {pessoa.nome.toLowerCase() === 'garrido' ? '💩' : estrelas}
                    {pessoa.nivel === 0 ? 'Goleiro' : ''}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => handleChangeNivel(0)}>Goleiro 🧤</MenuItem>
        {[5, 4, 3, 2, 1].map((nivel) => (
          <MenuItem key={nivel} onClick={() => handleChangeNivel(nivel)}>
            {'⭐'.repeat(nivel)}
          </MenuItem>
        ))}
      </Menu>

      <Button
        fullWidth
        variant="contained"
        color="secondary"
        disabled={pessoas.length <= 7}
        onClick={handleAvancar}
        sx={{ mt: 4, mb: 6 }}
      >
        Avançar
      </Button>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>Tem certeza que deseja limpar a lista?</DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="primary">
            Não
          </Button>
          <Button onClick={handleClearList} color="error">
            Sim
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isGutaoDialogOpen} onClose={() => setIsGutaoDialogOpen(false)}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>Esse Augusto é o Gutão?</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // NÃO → adiciona como Augusto normalmente
              adicionarPessoa(novoNome);
              setIsGutaoDialogOpen(false);
            }}
            color="primary"
          >
            Não
          </Button>
          <Button
            onClick={() => {
              // SIM → adiciona como Gutão com gradiente rainbow
              adicionarPessoa('Gutão', true);
              setIsGutaoDialogOpen(false);
            }}
            color="success"
          >
            Sim
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isGarridoDialogOpen} onClose={() => setIsGarridoDialogOpen(false)}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          🚨<b>ATENÇÃO</b>🚨
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          Essa ação pode afetar <b>MUITO</b> o nível do jogo. <br />
          Tem certeza que deseja fazer isso?
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setIsGarridoDialogOpen(false)} variant="contained" color="primary">
            Não
          </Button>
          <Button
            onClick={() => {
              adicionarPessoa(novoNome);
              setIsGarridoDialogOpen(false);
            }}
            variant="contained"
            color="success"
          >
            Sim
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
