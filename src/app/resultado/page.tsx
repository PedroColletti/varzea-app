"use client";

import { useEffect, useState } from "react";
import { Container, Typography, List, ListItem, ListItemText, Paper, Stack, Button } from "@mui/material";
import { useRouter } from "next/navigation";

type Pessoa = {
  id: number;
  nome: string;
  nivel: number;
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
    
    setTimes(balancearTimes(pessoas, quantidadeTimes));
  }, [router]);

  const balancearTimes = (pessoas: Pessoa[], quantidadeTimes: number): Time[] => {
    const pessoasOrdenadas = [...pessoas].sort((a, b) => a.nivel - b.nivel);
    
    const times: Time[] = Array.from({ length: quantidadeTimes }, (_, index) => ({
      id: index + 1,
      membros: []
    }));
  
    let index = 0;
    for (const pessoa of pessoasOrdenadas) {
      times[index].membros.push(pessoa);
      
      if (index === quantidadeTimes - 1) {
        times.reverse(); 
        index = 0;
      } else {
        index++;
      }
    }
  
    return times.sort((a, b) => a.id - b.id);
  }
  

  return (
    <Container maxWidth="sm" sx={{ mt: 4}}>
      <Typography variant="h5" marginBottom={4}  textAlign={'center'} gutterBottom>
        Times Formados 🏆
      </Typography>

      {times.map((time) => (
        <Paper key={time.id} sx={{ mb: 3, p: 2 }}>
          <Typography   variant="h6">TIME {time.id}</Typography>
          <List>
            {time.membros.map((membro) => (
              <ListItem key={membro.id}>
                <ListItemText
                  primary={membro.nome}
                  secondary={`Nível ${membro.nivel}`}
                />
              </ListItem>
            ))}
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
