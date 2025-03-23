"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Fade } from "@mui/material";
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";

type Pessoa = {
  id: number;
  nome: string;
  nivel: number;
};

export default function NiveisPage() {
  const [nome, setNome] = useState("");
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Estado para o modal
  const router = useRouter();

  useEffect(() => {
    const storedPessoas = localStorage.getItem("pessoas");
    if (storedPessoas) {
      setPessoas(JSON.parse(storedPessoas));
    }
  }, []);

  const handleAddPessoa = () => {
    if (nome.trim() === "") return;
  
    const novaPessoa = {
      id: Date.now(),
      nome,
      nivel: nome.toLowerCase() === "garrido" ? 3 : 1,
    };
  
    const novaLista = [...pessoas, novaPessoa];
    setPessoas(novaLista);
    localStorage.setItem("pessoas", JSON.stringify(novaLista));
    setNome("");
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
      if (pessoa?.nome.toLowerCase() === "garrido") {
        handleCloseMenu();
        return;
      }
  
      setPessoas((prev) =>
        prev.map((p) =>
          p.id === selectedId ? { ...p, nivel } : p
        )
      );
      handleCloseMenu();
    }
  };

  const handleDeletePessoa = (id: number) => {
    const novaLista = pessoas.filter((p) => p.id !== id);
    setPessoas(novaLista);
    localStorage.setItem("pessoas", JSON.stringify(novaLista));
  };
  

  const handleClearList = () => {
    setPessoas([]);
    setIsDialogOpen(false);
  };

  const handleAvancar = () => {
    localStorage.setItem("pessoas", JSON.stringify(pessoas));
    router.push("/times");
  };

  const getNivelStyle = (nivel: number, nome: string) => {
    if (nome.toLowerCase() === "garrido") {
      return { color: "red", estrelas: "🍆 HOMOSSEXUAL" };
    }
    switch (nivel) {
      case 1:
        return { color: "green", estrelas: "🌟🌟🌟" };
      case 2:
        return { color: "orange", estrelas: "🌟🌟" };
      case 3:
        return { color: "red", estrelas: "🌟" };
      default:
        return { color: "gray", estrelas: "" };
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Typography variant="h5" textAlign="center">Lista de Pessoas 📋</Typography>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleAddPessoa();
      }}>
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
        ):(     
        <Typography sx={{ mt: 2 }} textAlign="center">
         Insira ao menos 8 pessoas na lista
        </Typography>
      )}
      <Typography sx={{ mt: 2 }} textAlign="center">
        Total de pessoas na lista: {pessoas.length}
      </Typography>

      <List sx={{ maxHeight: { xs: "50vh", sm: "60vh", md: "70vh" }, overflowY: "auto" }}>
        {pessoas.map((pessoa) => {
          const { color, estrelas } = getNivelStyle(pessoa.nivel, pessoa.nome);
          return (
            <ListItem key={pessoa.id}
              secondaryAction={
                <>
                  {pessoa.nome.toLowerCase() !== "garrido" && (
                    <IconButton onClick={(e) => handleOpenMenu(e, pessoa.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => handleDeletePessoa(pessoa.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
            <ListItemText
              primary={pessoa.nome}
              secondary={<Typography sx={{ color }}>{estrelas} {`Nível ${pessoa.nivel}`}</Typography>}
            />
            </ListItem>
          );
        })}
      </List>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {[1, 2, 3].map((nivel) => (
          <MenuItem key={nivel} onClick={() => handleChangeNivel(nivel)}>
            Nível {nivel}
          </MenuItem>
        ))}
      </Menu>

      <Button
        fullWidth
        variant="contained"
        color="secondary"
        disabled={pessoas.length <= 7}
        onClick={handleAvancar}
        sx={{ mt: 3 }}
      >
        Avançar
      </Button>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>
          Tem certeza que deseja limpar a lista?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="primary">Não</Button>
          <Button onClick={handleClearList} color="error">Sim</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
