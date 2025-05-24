"use client";

import { useEffect, useState } from "react";
import { Container, Typography, List, ListItem, ListItemText, Paper, Stack, Button } from "@mui/material";
import { useRouter } from "next/navigation";

type Pessoa = {
  id: number;
  nome: string;
  nivel: number;
  mensalista?: boolean;
};


type Time = {
  id: number;
  membros: Pessoa[];
};

export default function ResultadoPage() {
  const [times, setTimes] = useState<Time[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedPessoas = localStorage.getItem("pessoas");
    const numTimes = localStorage.getItem("numTimes");

    if (!storedPessoas || !numTimes) {
      router.push("/");
      return;
    }

    const pessoas: Pessoa[] = JSON.parse(storedPessoas);
    const quantidadeTimes = parseInt(numTimes);

    console.log('pessoas', pessoas);
    
    
    setTimes(balancearTimes(pessoas, quantidadeTimes));
  }, [router]);

  const balancearTimes = (pessoas: Pessoa[], quantidadeTimes: number): Time[] => {
    const pessoasOrdenadas = [...pessoas].sort((a, b) => {
      const prioridade = (p: Pessoa) =>
        p.nivel === 0 ? 0 : p.mensalista ? 1 : 2;
      const prioridadeDiff = prioridade(a) - prioridade(b);
      if (prioridadeDiff !== 0) return prioridadeDiff;
      return a.nivel - b.nivel;
    });
  
    const times: Time[] = Array.from({ length: quantidadeTimes }, (_, index) => ({
      id: index + 1,
      membros: []
    }));
  
    const excedentes: Pessoa[] = [];
  
    let index = 0;
    for (const pessoa of pessoasOrdenadas) {
      if (times[index].membros.length < 7) {
        times[index].membros.push(pessoa);
      } else {
        const allFull = times.every(t => t.membros.length >= 7);
        if (allFull) {
          excedentes.push(pessoa);
        } else {
          index = (index + 1) % quantidadeTimes;
          if (pessoa) {
            pessoasOrdenadas.unshift(pessoa);
          }
                  }
      }
  
      index = (index + 1) % quantidadeTimes;
    }
  
    if (excedentes.length > 0) {
      times.push({
        id: -1, // ID especial
        membros: excedentes
      });
    }
  
    return times;
  };
  
  
  

  return (
    <Container maxWidth="sm" sx={{ mt: 4}}>
      <Typography variant="h5" marginBottom={4}  textAlign={'center'} gutterBottom>
        Times Formados 🏆
      </Typography>

      {times.map((time) => (
        <Paper key={time.id} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6">
            {time.id === -1 ? 'Próximos' : `TIME ${time.id}`}
          </Typography>
          <List>
            {time.membros.map((membro) => {
              const emotes = [];
              if (membro.nivel === 0) emotes.push("🧤");
              if (membro.mensalista) emotes.push("⭐");

              return (
                <ListItem key={membro.id}>
                  <ListItemText
                    primary={`${emotes.join(" ")} ${membro.nome}`}
                    secondary={membro.nivel === 0 ? 'Goleiro' : `Nível ${membro.nivel}`}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      ))}

      <Stack sx={{ margin: '50px 0 50px 0' }} direction="row" spacing={2}>
        <Button fullWidth   variant="contained" onClick={() => router.back()}>
          Voltar
        </Button>
      </Stack>
    </Container>
  );
}
