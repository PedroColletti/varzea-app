'use client';

import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  SportsHandball as GoalkeeperIcon,
  Shuffle as ShuffleIcon,
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
        <Typography variant="caption" sx={{ display: 'block' }}>
          Soma: {time.membros.reduce((soma, m) => soma + (m.nivel === 0 ? 3 : m.nivel), 0)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default function ResultadoPage() {
  const [times, setTimes] = useState<Time[]>([]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const router = useRouter();

  // Estados para controle de swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Cores para cada time
  const teamColors = [
    '#1976d2', // Azul
    '#f57c00', // Laranja
    '#7b1fa2', // Roxo
    '#d32f2f', // Vermelho
    '#388e3c', // Verde
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
    // Função para calcular soma total do time
    const calcularSomaTime = (time: Pessoa[]): number => {
      return time.reduce((soma, pessoa) => {
        // Goleiro conta como 3 para balanceamento
        return soma + (pessoa.nivel === 0 ? 3 : pessoa.nivel);
      }, 0);
    };

    // Separar e ordenar por prioridade
    const goleiros = pessoas.filter((p) => p.nivel === 0);
    const mensalistas = pessoas.filter((p) => p.nivel !== 0 && p.mensalista);
    const naoMensalistas = pessoas.filter((p) => p.nivel !== 0 && !p.mensalista);

    // Ordenar cada grupo por nível (maior para menor)
    const goleirosPorNivel = [...goleiros].sort((a, b) => b.nivel - a.nivel);
    const mensalistasPorNivel = [...mensalistas].sort((a, b) => b.nivel - a.nivel);
    const naoMensalistasPorNivel = [...naoMensalistas].sort((a, b) => b.nivel - a.nivel);

    // Criar times vazios
    const times: Time[] = Array.from({ length: quantidadeTimes }, (_, index) => ({
      id: index + 1,
      membros: [],
    }));

    const excedentes: Pessoa[] = [];

    // Lista ordenada por prioridade: goleiros -> mensalistas -> não mensalistas
    const pessoasOrdenadas = [
      ...goleirosPorNivel,
      ...mensalistasPorNivel,
      ...naoMensalistasPorNivel,
    ];

    // Distribuir jogadores
    for (const pessoa of pessoasOrdenadas) {
      // Verificar se algum time ainda pode receber jogadores
      const temTimeComVaga = times.some((time) => time.membros.length < 7);

      if (temTimeComVaga) {
        // Para goleiros, distribuir um por time primeiro
        if (pessoa.nivel === 0) {
          const timeSemGoleiro = times.find(
            (time) => time.membros.length < 7 && !time.membros.some((m) => m.nivel === 0),
          );

          if (timeSemGoleiro) {
            timeSemGoleiro.membros.push(pessoa);
            continue;
          }
        }

        // Para outros jogadores, colocar no time com menor soma que tem vaga
        const timesComVaga = times.filter((time) => time.membros.length < 7);
        let menorSoma = Infinity;
        let timeEscolhido = 0;

        timesComVaga.forEach((time) => {
          const indexOriginal = times.indexOf(time);
          const soma = calcularSomaTime(time.membros);
          if (soma < menorSoma) {
            menorSoma = soma;
            timeEscolhido = indexOriginal;
          }
        });

        times[timeEscolhido].membros.push(pessoa);
      } else {
        // Todos os times estão cheios, adicionar aos excedentes
        excedentes.push(pessoa);
      }
    }

    // Adicionar time de excedentes se houver
    if (excedentes.length > 0) {
      times.push({
        id: -1,
        membros: excedentes,
      });
    }

    return times;
  };

  const nextTeam = () => {
    if (isTransitioning || times.length <= 1) return;
    setIsTransitioning(true);
    setCurrentTeam((prev) => (prev + 1) % times.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevTeam = () => {
    if (isTransitioning || times.length <= 1) return;
    setIsTransitioning(true);
    setCurrentTeam((prev) => (prev - 1 + times.length) % times.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Configurações do swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && times.length > 1) {
      nextTeam();
    }
    if (isRightSwipe && times.length > 1) {
      prevTeam();
    }
  };

  // Suporte para mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (touchStart === null) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && times.length > 1) {
      nextTeam();
    }
    if (isRightSwipe && times.length > 1) {
      prevTeam();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Função para randomizar times mantendo o equilíbrio
  const randomizarTimes = () => {
    if (isShuffling || times.length <= 1) return;

    setIsShuffling(true);

    // Filtrar apenas times principais (não excedentes)
    const timesParaRandomizar = times.filter((time) => time.id !== -1);
    const timeExcedentes = times.find((time) => time.id === -1);

    if (timesParaRandomizar.length <= 1) {
      setIsShuffling(false);
      return;
    }

    // Função para calcular soma do time
    const calcularSoma = (membros: Pessoa[]): number => {
      return membros.reduce((soma, pessoa) => soma + (pessoa.nivel === 0 ? 3 : pessoa.nivel), 0);
    };

    // Coletar todos os jogadores dos times principais
    const todosJogadores: Pessoa[] = [];
    timesParaRandomizar.forEach((time) => {
      todosJogadores.push(...time.membros);
    });

    // Separar por categoria
    const goleiros = todosJogadores.filter((p) => p.nivel === 0);
    const mensalistas = todosJogadores.filter((p) => p.nivel !== 0 && p.mensalista);
    const naoMensalistas = todosJogadores.filter((p) => p.nivel !== 0 && !p.mensalista);

    // Função para embaralhar array
    const embaralhar = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Embaralhar cada categoria
    const goleirosEmbaralhados = embaralhar(goleiros);
    const mensalistasEmbaralhados = embaralhar(mensalistas);
    const naoMensalistasEmbaralhados = embaralhar(naoMensalistas);

    // Limpar times
    const novosTimesLimpos = timesParaRandomizar.map((time) => ({
      ...time,
      membros: [] as Pessoa[],
    }));

    // Redistribuir goleiros (um por time)
    goleirosEmbaralhados.forEach((goleiro, index) => {
      const timeIndex = index % novosTimesLimpos.length;
      novosTimesLimpos[timeIndex].membros.push(goleiro);
    });

    // Redistribuir outros jogadores balanceando por soma
    const outrosJogadores = [...mensalistasEmbaralhados, ...naoMensalistasEmbaralhados];

    outrosJogadores.forEach((jogador) => {
      // Encontrar times que ainda têm vaga
      const timesComVaga = novosTimesLimpos.filter((time) => time.membros.length < 7);

      if (timesComVaga.length > 0) {
        // Escolher o time com menor soma
        let menorSoma = Infinity;
        let timeEscolhido = 0;

        timesComVaga.forEach((time) => {
          const indexOriginal = novosTimesLimpos.indexOf(time);
          const soma = calcularSoma(time.membros);
          if (soma < menorSoma) {
            menorSoma = soma;
            timeEscolhido = indexOriginal;
          }
        });

        novosTimesLimpos[timeEscolhido].membros.push(jogador);
      }
    });

    // Atualizar estado com os novos times
    const novosTimesCompletos = [...novosTimesLimpos];
    if (timeExcedentes) {
      novosTimesCompletos.push(timeExcedentes);
    }

    setTimes(novosTimesCompletos);

    // Simular delay para mostrar o loading
    setTimeout(() => {
      setIsShuffling(false);
    }, 1000);
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
          variant="h4"
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
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Diretoria comédia #ForaRenan
        </Typography>

        {/* Botão Randomizar */}
        {times.filter((time) => time.id !== -1).length > 1 && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<ShuffleIcon />}
              onClick={randomizarTimes}
              disabled={isShuffling || isTransitioning}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'grey.300',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isShuffling ? 'Randomizando...' : 'Randomizar Times'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Campo principal com swipe */}
      <Box
        sx={{ mb: 4, position: 'relative', overflow: 'hidden' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <Box
          sx={{
            display: 'flex',
            transform: `translateX(-${currentTeam * 100}%)`,
            transition: isTransitioning ? 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)' : 'none',
            cursor: times.length > 1 && !isShuffling ? 'grab' : 'default',
            opacity: isShuffling ? 0.7 : 1,
            filter: isShuffling ? 'blur(1px)' : 'none',
            '&:active': {
              cursor: times.length > 1 && !isShuffling ? 'grabbing' : 'default',
            },
          }}
        >
          {times.map((time, index) => (
            <Box key={time.id} sx={{ minWidth: '100%', px: 0.5 }}>
              <SoccerField time={time} teamColor={teamColors[index] || teamColors[0]} />
            </Box>
          ))}
        </Box>

        {/* Indicadores de navegação por swipe */}
        {times.length > 1 && !isShuffling && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.secondary',
            }}
          >
            <Typography variant="caption">← Deslize para navegar →</Typography>
          </Box>
        )}

        {/* Loading de shuffle */}
        {isShuffling && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              bgcolor: alpha('#000', 0.8),
              color: 'white',
              px: 3,
              py: 2,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <ShuffleIcon
              sx={{
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Randomizando times...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Controles de navegação */}
      {times.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mb: 4,
            mt: 6,
          }}
        >
          <IconButton
            onClick={prevTeam}
            disabled={isTransitioning || isShuffling}
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Stack direction="row" spacing={1}>
            {times.map((_, index) => (
              <Box
                key={index}
                onClick={() => {
                  if (!isTransitioning && !isShuffling) {
                    setIsTransitioning(true);
                    setCurrentTeam(index);
                    setTimeout(() => setIsTransitioning(false), 300);
                  }
                }}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === currentTeam ? 'primary.main' : 'grey.300',
                  cursor: isTransitioning || isShuffling ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: isTransitioning || isShuffling ? 'none' : 'scale(1.2)',
                  },
                }}
              />
            ))}
          </Stack>

          <IconButton
            onClick={nextTeam}
            disabled={isTransitioning || isShuffling}
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500',
              },
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
