"use client";

import { useState, useEffect } from "react";
import { Container, Typography, Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation";

export default function TimesPage() {
  const [times, setTimes] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedTimes = localStorage.getItem("numTimes");
    if (storedTimes) {
      setTimes(parseInt(storedTimes));
    }
  }, []);

  const handleSelectTimes = (quantidade: number) => {
    setTimes(quantidade);
  };

  const handleConfirm = () => {
    if (times) {
      localStorage.setItem("numTimes", times.toString());
      router.push("/resultado");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Typography variant="h5" textAlign={'center'} gutterBottom>
        Escolha quantos times serão 
      </Typography>

      <Stack spacing={2} sx={{ mt: 3 }}>
        {[2, 3, 4].map((num) => (
          <Button
            key={num}
            color="success"
            variant={times === num ? "contained" : "outlined"}
            onClick={() => handleSelectTimes(num)}
          >
            {num} Times
          </Button>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => router.back()}
        >
          Voltar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth

          disabled={!times}
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </Stack>
    </Container>
  );
}
