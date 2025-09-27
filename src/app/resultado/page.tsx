'use client';

import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  SportsHandball as GoalkeeperIcon,
  SportsSoccer as SoccerIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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

// Posições no campo para cada jogador
const fieldPositions = [
  { x: 12, y: 50, label: 'GOL' }, // Goleiro
  { x: 40, y: 50, label: 'ZAG' }, // Zag central
  { x: 45, y: 25, label: 'ZAG' }, // Zagueiro esquerdo
  { x: 45, y: 78, label: 'ZAG' }, // Zagueiro direito
  { x: 70, y: 50, label: 'MEI' }, // Meio-campo
  { x: 82, y: 27, label: 'ATA' }, // Atacante esquerdo
  { x: 82, y: 70, label: 'ATA' }, // Atacante direito
];

const PlayerCard: React.FC<{
  pessoa: Pessoa;
  position: { x: number; y: number; label: string };
  teamColor: string;
}> = ({ pessoa, position, teamColor }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translate(-50%, -50%) scale(1.1)',
          zIndex: 10,
        },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          bgcolor: teamColor,
          color: 'white',
          px: 1.5,
          py: 1,
          minWidth: '80px',
          textAlign: 'center',
          border: '2px solid white',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 'bold', display: 'block', fontSize: '0.7rem' }}
        >
          {pessoa.nome.length > 8 ? pessoa.nome.substring(0, 8) + '...' : pessoa.nome}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          {pessoa.nivel === 0 && <GoalkeeperIcon sx={{ fontSize: 12 }} />}
          {pessoa.mensalista && <StarIcon sx={{ fontSize: 12, color: '#FFD700' }} />}
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
            {pessoa.nivel === 0 ? 'GOL' : pessoa.nivel}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

const SoccerField: React.FC<{ time: Time; teamColor: string }> = ({ time, teamColor }) => {
  return (
    <Paper
      elevation={8}
      sx={{
        position: 'relative',
        width: '100%',
        height: '400px',
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        border: '4px solid white',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Campo de futebol */}
      <Box
        component="svg"
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Borda do campo */}
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="white" strokeWidth="0.5" />

        {/* Linha do meio */}
        <line x1="50" y1="2" x2="50" y2="98" stroke="white" strokeWidth="0.3" />

        {/* Círculo central */}
        <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.3" />

        {/* Área do goleiro */}
        <rect x="2" y="35" width="12" height="30" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="2" y="42" width="6" height="16" fill="none" stroke="white" strokeWidth="0.3" />

        {/* Marca do pênalti */}
        <circle cx="18" cy="50" r="0.8" fill="white" />
      </Box>

      {/* Jogadores */}
      {time.membros.map((membro, index) => {
        const position = fieldPositions[index] || {
          x: 85,
          y: 50 + (index - 6) * 15,
          label: 'SUB',
        };
        return (
          <PlayerCard key={membro.id} pessoa={membro} position={position} teamColor={teamColor} />
        );
      })}

      {/* Nome do time */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          bgcolor: alpha('#000', 0.7),
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {time.id === -1 ? 'Próximos Jogadores' : `TIME ${time.id}`}
        </Typography>
      </Box>

      {/* Estatísticas do time */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: alpha('#000', 0.7),
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 1,
        }}
      >
        <Typography variant="body2">{time.membros.length} jogadores</Typography>
      </Box>
    </Paper>
  );
};

export default function ResultadoPage() {
  const [times, setTimes] = useState<Time[]>([]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cores para cada time
  const teamColors = [
    '#1976d2', // Azul
    '#d32f2f', // Vermelho
    '#f57c00', // Laranja
    '#388e3c', // Verde
    '#7b1fa2', // Roxo
    '#0288d1', // Azul claro
  ];

  useEffect(() => {
    const storedPessoas = localStorage.getItem('pessoas');
    const numTimes = localStorage.getItem('numTimes');

    if (!storedPessoas || !numTimes) {
      router.push('/');
      return;
    }

    try {
      const pessoas: Pessoa[] = JSON.parse(storedPessoas);
      const quantidadeTimes = parseInt(numTimes);

      const timesBalanceados = balancearTimes(pessoas, quantidadeTimes);
      setTimes(timesBalanceados);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      router.push('/');
    }
  }, [router]);

  const balancearTimes = (pessoas: Pessoa[], quantidadeTimes: number): Time[] => {
    const pessoasOrdenadas = [...pessoas].sort((a, b) => {
      const prioridade = (p: Pessoa) => (p.nivel === 0 ? 0 : p.mensalista ? 1 : 2);
      const prioridadeDiff = prioridade(a) - prioridade(b);
      if (prioridadeDiff !== 0) return prioridadeDiff;

      return b.nivel - a.nivel;
    });

    const times: Time[] = Array.from({ length: quantidadeTimes }, (_, index) => ({
      id: index + 1,
      membros: [],
    }));

    const excedentes: Pessoa[] = [];

    let index = 0;
    for (const pessoa of pessoasOrdenadas) {
      if (times[index].membros.length < 7) {
        times[index].membros.push(pessoa);
      } else {
        const allFull = times.every((t) => t.membros.length >= 7);
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
        id: -1,
        membros: excedentes,
      });
    }

    return times;
  };

  const nextTeam = () => {
    setCurrentTeam((prev) => (prev + 1) % times.length);
  };

  const prevTeam = () => {
    setCurrentTeam((prev) => (prev - 1 + times.length) % times.length);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <SoccerIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5">Carregando times...</Typography>
      </Container>
    );
  }

  if (times.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Nenhum time foi formado
        </Typography>
        <Button variant="contained" onClick={() => router.push('/')} startIcon={<ArrowBackIcon />}>
          Voltar ao início
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1976d2 30%, #4caf50 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Times Formados 🏆
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Diretoria comédia #ForaRenan
        </Typography>
      </Box>

      {/* Campo principal */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ mb: 4 }}>
          <SoccerField
            time={times[currentTeam]}
            teamColor={teamColors[currentTeam] || teamColors[0]}
          />
        </Box>
      </Fade>

      {/* Controles de navegação */}
      {times.length > 1 && (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 4 }}
        >
          <IconButton
            onClick={prevTeam}
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Stack direction="row" spacing={1}>
            {times.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentTeam(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === currentTeam ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.2)' },
                }}
              />
            ))}
          </Stack>

          <IconButton
            onClick={nextTeam}
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      )}

      {/* Detalhes do time atual */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Detalhes -{' '}
          {times[currentTeam].id === -1 ? 'Próximos Jogadores' : `TIME ${times[currentTeam].id}`}
        </Typography>
        <Grid container spacing={2}>
          {times[currentTeam].membros.map((membro) => (
            <Grid item xs={12} sm={6} md={4} key={membro.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  border: `2px solid ${teamColors[currentTeam] || teamColors[0]}`,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {membro.nivel === 0 && (
                      <GoalkeeperIcon sx={{ color: 'orange', fontSize: 20 }} />
                    )}
                    {membro.mensalista && <StarIcon sx={{ color: '#FFD700', fontSize: 20 }} />}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {membro.nome}
                    </Typography>
                  </Box>
                  <Chip
                    label={membro.nivel === 0 ? 'Goleiro' : `Nível ${membro.nivel}`}
                    size="small"
                    color={membro.nivel === 0 ? 'warning' : 'primary'}
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Botão voltar */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ px: 4, py: 1.5 }}
        >
          Voltar
        </Button>
      </Box>
    </Container>
  );
}
