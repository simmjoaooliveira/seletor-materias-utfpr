import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ReactFlow, Background, Controls, ReactFlowProvider, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import materiasData from "./data/materias.json";

const PERIODOS = [
  { id: "1", label: "1º Período" },
  { id: "2", label: "2º Período" },
  { id: "3", label: "3º Período" },
  { id: "4", label: "4º Período" },
  { id: "5", label: "5º Período" },
  { id: "6", label: "6º Período" },
  { id: "7", label: "7º Período" },
  { id: "8", label: "8º Período" },
  { id: "9", label: "9º Período" },
  { id: "10", label: "10º Período" },
];

// Função para obter cor da trilha
function getTrilhaColor(trilha) {
  const cores = {
    'Matemática e Física': 'bg-blue-100 text-blue-700 border-blue-300',
    'Computação': 'bg-orange-100 text-orange-700 border-orange-300',
    'Eletrônica': 'bg-green-100 text-green-700 border-green-300',
    'Industrial': 'bg-red-100 text-red-700 border-red-300',
    'Biomédica': 'bg-purple-100 text-purple-700 border-purple-300',
    'Interdisciplinar': 'bg-gray-100 text-gray-700 border-gray-300',
    'Trilha de Aprofundamento': 'bg-purple-100 text-purple-700 border-purple-300'
  };
  return cores[trilha] || 'bg-gray-100 text-gray-700 border-gray-300';
}

// Função para obter cor da borda lateral
function getTrilhaBorderColor(trilha) {
  const cores = {
    'Matemática e Física': 'border-l-blue-500',
    'Computação': 'border-l-orange-500',
    'Eletrônica': 'border-l-green-500',
    'Industrial': 'border-l-red-500',
    'Biomédica': 'border-l-purple-500',
    'Interdisciplinar': 'border-l-gray-500',
    'Trilha de Aprofundamento': 'border-l-purple-500'
  };
  return cores[trilha] || 'border-l-gray-300';
}

// Função para obter cor hexadecimal da trilha (para SVG)
function getTrilhaColorHex(trilha) {
  const cores = {
    'Matemática e Física': '#3b82f6',
    'Computação': '#f97316',
    'Eletrônica': '#22c55e',
    'Industrial': '#ef4444',
    'Biomédica': '#a855f7',
    'Interdisciplinar': '#6b7280',
    'Trilha de Aprofundamento': '#a855f7'
  };
  return cores[trilha] || '#6b7280';
}

// Converter dados do JSON para o formato esperado pelo app
function processarMaterias() {
  const materiasPorPeriodo = {};
  const todasMaterias = {};
  
  materiasData.forEach(materia => {
    const periodoKey = String(materia.periodo);
    if (!materiasPorPeriodo[periodoKey]) {
      materiasPorPeriodo[periodoKey] = [];
    }
    
    const codigo = materia.id || materia.nome; 
    
    // Função auxiliar para garantir que tudo vire um Array certinho
    const formatarArray = (item) => Array.isArray(item) ? item : (item ? [item] : []);

    const materiaProcessada = {
      codigo: codigo,
      nome: materia.nome,
      periodo: materia.periodo,
      descricao: materia.ementa ? materia.ementa.substring(0, 100) + '...' : `Disciplina do ${materia.periodo}º período.`,
      descricaoDetalhada: materia.ementa || `Esta disciplina faz parte do ${materia.periodo}º período do curso de Engenharia Eletrônica.`,
      carga: materia.carga ? `${materia.carga}h` : "—",
      aulasSemanais: materia.aulasSemanais || null,
      prereq: formatarArray(materia.preRequisito), // Agora lê múltiplos pré-requisitos!
      professor: "—",
      horario: "—",
      sala: "—",
      ementa: materia.ementa || null,
      preRequisito: materia.preRequisito || null,
      prepara: formatarArray(materia.prepara),
      requer: formatarArray(materia.requer),
      trilha: materia.trilha || null
    };
    
    materiasPorPeriodo[periodoKey].push(materiaProcessada);
    todasMaterias[codigo] = materiaProcessada; 
  });
  
  Object.values(materiasPorPeriodo).flat().forEach(m => {
    if (m.prereq && m.prereq.length > 0) {
      const prereqsValidos = [];
      m.prereq.forEach(req => {
        let preReqMateria = todasMaterias[req];
        if (!preReqMateria) {
          preReqMateria = Object.values(todasMaterias).find(mat => mat.nome === req);
        }
        if (preReqMateria) {
          prereqsValidos.push(preReqMateria.codigo);
        }
      });
      m.prereq = prereqsValidos;
    }
  });
  
  return { materiasPorPeriodo, todasMaterias };
}

const { materiasPorPeriodo: MATERIAS_POR_PERIODO, todasMaterias: TODAS_MATERIAS } = processarMaterias();

// ==========================================
// COMPONENTE 1: TELA INICIAL
// ==========================================
function TelaInicial() {
  const navigate = useNavigate();
  const [mostrarModalInstagram, setMostrarModalInstagram] = useState(false);
  const [mostrarModalSite, setMostrarModalSite] = useState(false);

  const totalMaterias = Object.values(MATERIAS_POR_PERIODO).flat().length;
  const totalPeriodos = PERIODOS.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-y-auto relative">
      {/* Background animado - Circuitos */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          <motion.path
            d="M 100 100 L 300 100 L 300 200 L 500 200 L 500 300 L 700 300"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M 200 400 L 400 400 L 400 500 L 600 500 L 600 600 L 800 600"
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          />
          <motion.path
            d="M 300 200 L 300 400 L 500 400 L 500 600"
            stroke="#f97316"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          />
          <motion.path
            d="M 800 100 L 1000 100 L 1000 200 L 1100 200"
            stroke="#a855f7"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1.5 }}
          />
          <motion.path
            d="M 900 300 L 900 500 L 1100 500"
            stroke="#ec4899"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: 2 }}
          />
          {[
            { x: 300, y: 200, delay: 0 },
            { x: 500, y: 300, delay: 0.5 },
            { x: 600, y: 500, delay: 1 },
            { x: 900, y: 300, delay: 1.5 },
            { x: 1000, y: 200, delay: 2 },
          ].map((node, i) => (
            <motion.circle
              key={i}
              cx={node.x}
              cy={node.y}
              r="4"
              fill="#fbbf24"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: node.delay }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen p-4 sm:p-8 py-12 sm:py-16" style={{ pointerEvents: 'auto' }}>
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Engenharia Eletrônica
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300">
            Sistema de Seleção de Matérias
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full max-w-5xl mx-auto mb-8 sm:mb-12 relative z-10 mt-8 sm:mt-12"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <motion.div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1">{totalPeriodos}</div>
              <div className="text-xs sm:text-sm text-gray-300">Períodos</div>
            </motion.div>
            <motion.div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-1">{totalMaterias}</div>
              <div className="text-xs sm:text-sm text-gray-300">Matérias</div>
            </motion.div>
            <motion.div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-orange-400 mb-1">3</div>
              <div className="text-xs sm:text-sm text-gray-300">Trilhas</div>
            </motion.div>
            <motion.div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-1">5</div>
              <div className="text-xs sm:text-sm text-gray-300">Anos</div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative overflow-hidden">
              <div className="text-2xl mb-2 relative z-10">💻</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 relative z-10">Engenharia de Computação</h3>
              <p className="text-gray-300 text-xs sm:text-sm relative z-10">Sistemas computacionais, software e hardware.</p>
            </motion.div>
            <motion.div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative overflow-hidden">
              <div className="text-2xl mb-2 relative z-10">🏭</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 relative z-10">Engenharia Industrial</h3>
              <p className="text-gray-300 text-xs sm:text-sm relative z-10">Otimização de processos e sistemas produtivos.</p>
            </motion.div>
            <motion.div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative overflow-hidden">
              <div className="text-2xl mb-2 relative z-10">🏥</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 relative z-10">Engenharia Biomédica</h3>
              <p className="text-gray-300 text-xs sm:text-sm relative z-10">Instrumentação médica e equipamentos de saúde.</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center relative mt-8 sm:mt-12"
          style={{ zIndex: 50, pointerEvents: 'auto' }}
        >
          <motion.button
            onClick={() => navigate('/selecao_materia')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold text-lg sm:text-xl rounded-xl shadow-2xl transform transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: ["0 0 20px rgba(59, 130, 246, 0.5)", "0 0 30px rgba(34, 197, 94, 0.7)", "0 0 20px rgba(59, 130, 246, 0.5)"],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="flex items-center gap-2">
              <span>🔌</span>
              <span>Matérias</span>
              <span>⚡</span>
            </span>
          </motion.button>

          <div className="flex gap-4" style={{ position: 'relative', zIndex: 51 }}>
            <motion.button
              onClick={() => setMostrarModalInstagram(true)}
              className="px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">📷</span>
              <span className="hidden sm:inline">Instagram</span>
            </motion.button>
            
            <motion.button
              onClick={() => setMostrarModalSite(true)}
              className="px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">🏛️</span>
              <span className="hidden sm:inline">Site do Curso</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/fluxograma')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg sm:text-xl rounded-xl shadow-2xl transform transition-all cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="flex items-center gap-2">
                <span>📊</span>
                <span>Fluxograma</span>
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modal do Site da UTFPR embutido */}
      <AnimatePresence>
        {mostrarModalSite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setMostrarModalSite(false)}
            style={{ zIndex: 10005 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden max-w-7xl"
              style={{ zIndex: 10006 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Navegador Embutido */}
              <div className="flex items-center justify-between p-4 bg-slate-100 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏛️</span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    Portal UTFPR - Engenharia Eletrônica
                  </h2>
                </div>
                <motion.button
                  onClick={() => setMostrarModalSite(false)}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors shadow-md flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Fechar
                </motion.button>
              </div>

              {/* Corpo do Site (Iframe) com "Zoom" (Scale) de 67% */}
              <div className="flex-1 w-full bg-white relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center -z-10 bg-gray-50">
                  <p className="text-gray-400 font-medium animate-pulse">Carregando portal...</p>
                </div>
                
                {/* O container abaixo cria um "canvas" maior que a tela 
                  (cerca de 150% do tamanho) e depois encolhe (escala) tudo 
                  para 67%, fazendo o conteúdo do site parecer menor, 
                  exibindo muito mais informação sem barra de rolagem horizontal.
                */}
                <div 
                  style={{
                    width: '150%',        // Compensa a redução
                    height: '150%',       // Compensa a redução
                    transform: 'scale(0.67)', // O "zoom out" equivalente a 67%
                    transformOrigin: 'top left' // Ponto de partida da redução
                  }}
                >
                  <iframe
                    src="https://www.utfpr.edu.br/cursos/coordenacoes/graduacao/campo-mourao/cm-engenharia-eletronica"
                    title="Site Oficial UTFPR"
                    className="w-full h-full border-none z-10 relative"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarModalInstagram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setMostrarModalInstagram(false)}
            style={{ zIndex: 10005 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
              style={{ zIndex: 10006 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📷</span>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Instagram
                  </h2>
                </div>
                <motion.button
                  onClick={() => setMostrarModalInstagram(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  ×
                </motion.button>
              </div>

              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('https://www.instagram.com/eletronicautfprcm/')}`}
                    alt="QR Code Instagram"
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">Escaneie o QR Code para acessar nosso Instagram</p>
              </div>

              <div className="mt-4 w-full">
                <motion.button
                  onClick={() => setMostrarModalInstagram(false)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Fechar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// COMPONENTE 2: TELA DE FLUXOGRAMA (NOVO)
// ==========================================
function TelaFluxograma() {
  const navigate = useNavigate();
  const [trilhaFiltroFluxograma, setTrilhaFiltroFluxograma] = useState(null);
  const [materiaDetalhada, setMateriaDetalhada] = useState(null);

  const handleMateriaClick = useCallback((materia) => {
    setMateriaDetalhada(materia);
  }, []);

  function fecharDetalhes() {
    setMateriaDetalhada(null);
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header Fixo do Fluxograma */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 flex-shrink-0 relative">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <motion.button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center gap-2 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Voltar
          </motion.button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Fluxograma do Curso</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
              Arraste para navegar e clique nas matérias para ver as conexões
            </p>
          </div>
        </div>
        
        {/* Filtros de Trilha */}
        <div className="flex gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto overflow-y-auto max-h-24 sm:max-h-none">
          <button
            onClick={() => setTrilhaFiltroFluxograma(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              trilhaFiltroFluxograma === null
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          {['Matemática e Física', 'Computação', 'Eletrônica', 'Industrial', 'Biomédica', 'Interdisciplinar'].map((trilha) => (
            <button
              key={trilha}
              onClick={() => setTrilhaFiltroFluxograma(trilha)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap bg-white ${getTrilhaColor(trilha)} ${
                trilhaFiltroFluxograma === trilha
                  ? 'ring-2 ring-offset-1 ring-indigo-500 shadow-sm'
                  : 'hover:bg-gray-50'
              }`}
            >
              {trilha}
            </button>
          ))}
        </div>
      </div>

      {/* Container Principal do Fluxograma */}
      <div className="flex-1 w-full relative bg-gray-100">
        <FluxogramaView 
          todasMaterias={TODAS_MATERIAS}
          trilhaFiltro={trilhaFiltroFluxograma}
          getTrilhaColor={getTrilhaColor}
          getTrilhaBorderColor={getTrilhaBorderColor}
          getTrilhaColorHex={getTrilhaColorHex}
          onMateriaClick={handleMateriaClick}
        />
      </div>

      {/* Modal de Detalhes da Matéria clicada no Fluxograma */}
      <AnimatePresence>
        {materiaDetalhada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={fecharDetalhes}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{materiaDetalhada.nome}</h2>
                  <p className="text-sm sm:text-lg text-gray-600">
                  {materiaDetalhada.codigo} • {materiaDetalhada.carga}
                  {materiaDetalhada.aulasSemanais && (
                    <span className="ml-2 font-semibold text-indigo-600">
                    • {materiaDetalhada.aulasSemanais} aulas/sem
                    </span>
                  )}
                  </p>
                </div>
                <button onClick={fecharDetalhes} className="text-gray-400 hover:text-gray-600 text-2xl font-bold flex-shrink-0">
                  ×
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {materiaDetalhada.ementa && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Ementa</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{materiaDetalhada.ementa}</p>
                  </div>
                )}

                {materiaDetalhada.trilha && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Trilha Principal</h3>
                    <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${getTrilhaColor(materiaDetalhada.trilha)}`}>
                      {materiaDetalhada.trilha}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Pré-requisitos</h3>
                  {materiaDetalhada.preRequisito ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{materiaDetalhada.preRequisito}</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Obrigatório</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Nenhum pré-requisito obrigatório</p>
                  )}
                </div>

                {materiaDetalhada.prepara && materiaDetalhada.prepara.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Esta disciplina prepara para</h3>
                    <div className="flex flex-wrap gap-2">
                      {materiaDetalhada.prepara.map((nome, idx) => {
                        const mat = Object.values(TODAS_MATERIAS).find(m => m.nome === nome);
                        return (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm">
                            {nome} {mat && ` (${mat.periodo}º período)`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {materiaDetalhada.requer && materiaDetalhada.requer.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Conhecimentos recomendados</h3>
                    <div className="flex flex-wrap gap-2">
                      {materiaDetalhada.requer.map((nome, idx) => {
                        const mat = Object.values(TODAS_MATERIAS).find(m => m.nome === nome);
                        return (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm">
                            {nome} {mat && ` (${mat.periodo}º período)`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end">
                <button onClick={fecharDetalhes} className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// COMPONENTE 3: SELEÇÃO DE MATÉRIAS
// ==========================================
function SelecaoPeriodoMaterias() {
  const navigate = useNavigate();
  const [periodoSelecionado, setPeriodoSelecionado] = useState("1"); 
  const [materiasConcluidas, setMateriasConcluidas] = useState([]);
  const [possiveisMaterias, setPossiveisMaterias] = useState([]);
  const [mostrarModalPossiveis, setMostrarModalPossiveis] = useState(false);
  const [query, setQuery] = useState("");
  const [mostrarConfirmacaoPeriodos, setMostrarConfirmacaoPeriodos] = useState(false);
  const [mostrarModalMateriasAnteriores, setMostrarModalMateriasAnteriores] = useState(false);
  const [periodoMinimoMarcado, setPeriodoMinimoMarcado] = useState(null);
  const [materiasConcluidasAntesModal, setMateriasConcluidasAntesModal] = useState([]);
  const [materiaDetalhada, setMateriaDetalhada] = useState(null);

  const periodoParaMostrar = periodoSelecionado;
  const materias = MATERIAS_POR_PERIODO[periodoParaMostrar] || [];

  function toggleConcluida(codigo) {
    setMateriasConcluidas((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    );
  }

  function desmarcarTodasMaterias() {
    const codigosDoPeriodo = materiasFiltradas.map(m => m.codigo);
    setMateriasConcluidas((prev) => 
      prev.filter(codigo => !codigosDoPeriodo.includes(codigo))
    );
  }

  function marcarTodasMaterias() {
    const codigosDoPeriodo = materiasFiltradas.map(m => m.codigo);
    setMateriasConcluidas((prev) => {
      const novas = [...prev];
      codigosDoPeriodo.forEach(codigo => {
        if (!novas.includes(codigo)) {
          novas.push(codigo);
        }
      });
      return novas;
    });
  }

  function abrirDetalhes(materia) {
    setMateriaDetalhada(materia);
  }

  function fecharDetalhes() {
    setMateriaDetalhada(null);
  }

  function calcularPossiveisMaterias() {
    if (!periodoSelecionado) return;

    setPeriodoMinimoMarcado(null);
    setMostrarConfirmacaoPeriodos(false);
    setMostrarModalMateriasAnteriores(false);

    const materiasParaVerificar = materiasConcluidasAntesModal.length > 0 
      ? materiasConcluidasAntesModal 
      : materiasConcluidas;

    if (materiasParaVerificar.length > 0) {
      const periodosMarcados = materiasParaVerificar.map(codigo => {
        const materia = Object.values(TODAS_MATERIAS).find(m => m.codigo === codigo);
        return materia ? parseInt(materia.periodo) : null;
      }).filter(p => p !== null);

      if (periodosMarcados.length > 0) {
        const periodoMin = Math.min(...periodosMarcados);
        if (periodoMin > 1) {
          setPeriodoMinimoMarcado(periodoMin);
          setMostrarConfirmacaoPeriodos(true);
          return;
        }
      }
    }

    if (materiasParaVerificar.length > 0) {
      const periodosMarcados = materiasParaVerificar.map(codigo => {
        const materia = Object.values(TODAS_MATERIAS).find(m => m.codigo === codigo);
        return materia ? parseInt(materia.periodo) : null;
      }).filter(p => p !== null);
      if (periodosMarcados.length > 0) {
        const periodoMin = Math.min(...periodosMarcados);
        if (periodoMin === 1) {
          setMateriasConcluidasAntesModal([]);
        }
      }
    }
    executarCalculo();
  }

  function executarCalculo() {
    if (!periodoSelecionado) return;

    let periodosConsiderados;
    if (materiasConcluidas.length === 0) {
      periodosConsiderados = ["1"];
    } else {
      const periodosMarcados = materiasConcluidas.map(codigo => {
        const materia = Object.values(TODAS_MATERIAS).find(m => m.codigo === codigo);
        return materia ? parseInt(materia.periodo) : null;
      }).filter(p => p !== null);
      
      const periodoMinMarcado = periodosMarcados.length > 0 ? Math.min(...periodosMarcados) : 1;
      const idxAtual = PERIODOS.findIndex((p) => p.id === periodoSelecionado);
      
      const periodoInicio = Math.min(periodoMinMarcado, parseInt(periodoSelecionado));
      const idxInicio = PERIODOS.findIndex((p) => parseInt(p.id) === periodoInicio);
      const idxFim = Math.min(idxAtual + 3, PERIODOS.length);
      
      periodosConsiderados = PERIODOS.slice(idxInicio, idxFim).map((p) => p.id);
    }

    let candidatas = [];
    periodosConsiderados.forEach((pid) => {
      const list = MATERIAS_POR_PERIODO[pid] || [];
      const periodoInfo = PERIODOS.find((p) => p.id === pid);
      list.forEach((m) => {
        const prereqOk = m.prereq.length === 0 || m.prereq.every((pre) => materiasConcluidas.includes(pre));
        const naoConcluida = !materiasConcluidas.includes(m.codigo);

        if (prereqOk && naoConcluida) {
          candidatas.push({
            ...m,
            semestre: periodoInfo ? periodoInfo.label : pid
          });
        }
      });
    });
    
    candidatas.sort((a, b) => {
      if (a.periodo !== b.periodo) return a.periodo - b.periodo;
      return (b.aulasSemanais || 0) - (a.aulasSemanais || 0);
    });

    setPossiveisMaterias(candidatas);
    setMostrarModalPossiveis(true);
  }

  function marcarTodasMateriasAnteriores() {
    if (!periodoMinimoMarcado) return;

    const materiasParaMarcar = [];
    for (let i = 1; i < periodoMinimoMarcado; i++) {
      const list = MATERIAS_POR_PERIODO[i.toString()] || [];
      list.forEach(m => {
        if (!materiasConcluidas.includes(m.codigo)) {
          materiasParaMarcar.push(m.codigo);
        }
      });
    }

    setMateriasConcluidas(prev => [...prev, ...materiasParaMarcar]);
    setMostrarConfirmacaoPeriodos(false);
    setPeriodoMinimoMarcado(null);
    executarCalculo();
  }

  function abrirModalMateriasAnteriores() {
    let materiasParaSalvar = [...materiasConcluidas];
    
    if (materiasConcluidasAntesModal.length > 0 && periodoMinimoMarcado) {
      const materiasParaLimpar = [];
      for (let i = 1; i < periodoMinimoMarcado; i++) {
        const list = MATERIAS_POR_PERIODO[i.toString()] || [];
        list.forEach(m => {
          if (materiasConcluidas.includes(m.codigo)) {
            materiasParaLimpar.push(m.codigo);
          }
        });
      }
      
      if (materiasParaLimpar.length > 0) {
        materiasParaSalvar = materiasConcluidas.filter(codigo => !materiasParaLimpar.includes(codigo));
        setMateriasConcluidas(materiasParaSalvar);
      }
    }
    
    setMateriasConcluidasAntesModal(materiasParaSalvar);
    setMostrarConfirmacaoPeriodos(false);
    setMostrarModalMateriasAnteriores(true);
  }

  const materiasFiltradas = materias.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      m.nome.toLowerCase().includes(q) ||
      m.codigo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-2 sm:p-4 lg:p-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" />
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      <div className="fixed inset-0 pointer-events-none z-0">
        {[
          { size: 300, x: '10%', y: '20%', color: 'rgba(99, 102, 241, 0.05)' },
          { size: 400, x: '90%', y: '80%', color: 'rgba(59, 130, 246, 0.04)' },
          { size: 250, x: '50%', y: '10%', color: 'rgba(139, 92, 246, 0.03)' },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, backgroundColor: orb.color, transform: 'translate(-50%, -50%)' }}
            animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "easeInOut", delay: i * 2 }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white backdrop-blur-xl rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-2xl border border-gray-200 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
          />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Voltar
              </motion.button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">Selecione o período</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Escolha o semestre para ver e marcar as matérias que você já fez.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/50"
        >
        <section className="mb-4 sm:mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-3">
              {PERIODOS.map((p, index) => (
                <motion.button
                  key={p.id}
                  onClick={() => setPeriodoSelecionado(p.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`px-3 sm:px-4 py-2.5 rounded-full border-2 transition-all font-semibold text-xs sm:text-sm focus:outline-none relative overflow-hidden w-full
                    ${p.id === periodoSelecionado 
                      ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl border-transparent" 
                      : "bg-white/70 backdrop-blur-sm text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-white/90 hover:shadow-md"}`}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 whitespace-nowrap">{p.label}</span>
                </motion.button>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative group">
                <motion.div 
                  className="absolute left-4 top-0 bottom-0 flex items-center text-gray-400 text-lg pointer-events-none z-10"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🔍
                </motion.div>
                <motion.input
                  type="text"
                  placeholder="Pesquisar matérias..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all shadow-sm hover:shadow-lg"
                  whileFocus={{ scale: 1.02 }}
                />
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                  >
                    ✕
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
          <motion.p 
            className="mt-3 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Período selecionado: <motion.span 
              className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              key={periodoSelecionado}
            >
              {PERIODOSText(periodoSelecionado)}
            </motion.span>
          </motion.p>
        </section>

        <main className="space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col lg:flex-row gap-4 items-start lg:items-center"
          >
            <motion.section className="bg-gradient-to-r from-gray-50 via-blue-50/40 to-indigo-50/30 rounded-xl p-3 border border-gray-200/50 shadow-md backdrop-blur-sm flex-1">
              <h3 className="text-xs sm:text-sm font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Legenda das Trilhas
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { name: 'Matemática e Física', emoji: '🔵', delay: 0.4 },
                  { name: 'Computação', emoji: '🟠', delay: 0.45 },
                  { name: 'Eletrônica', emoji: '🟢', delay: 0.5 },
                  { name: 'Industrial', emoji: '🔴', delay: 0.55 },
                  { name: 'Biomédica', emoji: '🟣', delay: 0.6 },
                  { name: 'Interdisciplinar', emoji: '⚪', delay: 0.65 },
                ].map((trilha) => (
                  <motion.span
                    key={trilha.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: trilha.delay, duration: 0.3 }}
                    className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium border cursor-default transition-all ${getTrilhaColor(trilha.name)}`}
                  >
                    {trilha.emoji} {trilha.name}
                  </motion.span>
                ))}
              </div>
            </motion.section>

            <motion.div 
              className="w-full lg:w-auto flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.button
                onClick={calcularPossiveisMaterias}
                className="w-full lg:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xl hover:shadow-green-500/50 transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}>⚡</motion.span>
                  <span className="whitespace-nowrap">Calcular possíveis matérias</span>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            key={periodoSelecionado}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="text-base sm:text-lg font-bold flex items-center gap-2 flex-1"
              >
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-2xl">📚</motion.span>
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Matérias do período selecionado
                </span>
              </motion.h2>
              
              <div className="flex items-center gap-2">
                {materiasFiltradas.some(m => !materiasConcluidas.includes(m.codigo)) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={marcarTodasMaterias}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>✅</span>
                    <span className="hidden sm:inline">Marcar todas</span>
                    <span className="sm:hidden">Marcar</span>
                  </motion.button>
                )}

                {materiasFiltradas.some(m => materiasConcluidas.includes(m.codigo)) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={desmarcarTodasMaterias}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>🗑️</span>
                    <span className="hidden sm:inline">Desmarcar todas</span>
                    <span className="sm:hidden">Limpar</span>
                  </motion.button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {materiasFiltradas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-6 sm:p-8 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gradient-to-br from-gray-50 to-blue-50/30"
                >
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-3">📚</motion.div>
                  <p className="text-sm font-medium text-gray-500">Nenhuma matéria carregada.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  {materiasFiltradas.map((m, index) => (
                    <motion.article
                      key={m.codigo}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className={`bg-white border-l-4 rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-300 relative overflow-hidden group ${m.trilha ? getTrilhaBorderColor(m.trilha) : 'border-l-gray-300'} ${materiasConcluidas.includes(m.codigo) ? "ring-2 ring-green-400/50 bg-gradient-to-br from-green-50/50 to-white" : "hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-white"}`}
                      whileTap={{ scale: 1 }}
                    >
                      <div className="space-y-3 relative z-10">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm sm:text-base font-semibold flex-1">{m.nome}</h3>
                            {m.trilha && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${getTrilhaColor(m.trilha)}`}>
                                {m.trilha}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {m.codigo} • {m.carga}
                            {m.aulasSemanais && <span className="ml-2 text-indigo-600 font-semibold">• {m.aulasSemanais} aulas/sem</span>}
                          </div>
                          <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">{m.descricao}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 relative z-10">
                          <motion.button 
                            onClick={() => abrirDetalhes(m)}
                            className="flex-1 px-3 py-2 text-xs sm:text-sm border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 text-center transition-all duration-300 font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            📖 Ver detalhes
                          </motion.button>
                          <motion.button
                            onClick={() => toggleConcluida(m.codigo)}
                            className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl font-medium transition-all duration-300 ${materiasConcluidas.includes(m.codigo) ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg" : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"}`}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {materiasConcluidas.includes(m.codigo) ? "❌ Remover" : "✅ Concluído"}
                          </motion.button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.section>

        </main>
        </motion.div>
      </div>

      <AnimatePresence>
        {materiaDetalhada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={fecharDetalhes}
            style={{ zIndex: 10003 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              style={{ zIndex: 10004 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{materiaDetalhada.nome}</h2>
                  <p className="text-sm sm:text-lg text-gray-600">
                  {materiaDetalhada.codigo} • {materiaDetalhada.carga}
                  {materiaDetalhada.aulasSemanais && (
                  <span className="ml-2 font-semibold text-indigo-600">
                  • {materiaDetalhada.aulasSemanais} aulas/sem
                  </span>
                  )}
                </p>
                </div>
                <button onClick={fecharDetalhes} className="text-gray-400 hover:text-gray-600 text-2xl font-bold flex-shrink-0">×</button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {materiaDetalhada.ementa && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Ementa</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{materiaDetalhada.ementa}</p>
                  </div>
                )}
                {materiaDetalhada.trilha && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Trilha Principal</h3>
                    <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${getTrilhaColor(materiaDetalhada.trilha)}`}>
                      {materiaDetalhada.trilha}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Pré-requisitos</h3>
                  {materiaDetalhada.preRequisito ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{materiaDetalhada.preRequisito}</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Obrigatório</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Nenhum pré-requisito obrigatório</p>
                  )}
                </div>
                {materiaDetalhada.prepara && materiaDetalhada.prepara.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Esta disciplina prepara para</h3>
                    <div className="flex flex-wrap gap-2">
                      {materiaDetalhada.prepara.map((nome, idx) => {
                        const materiaRelacionada = Object.values(TODAS_MATERIAS).find(m => m.nome === nome);
                        return (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm">
                            {nome} {materiaRelacionada && ` (${materiaRelacionada.periodo}º período)`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end">
                <button onClick={fecharDetalhes} className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarConfirmacaoPeriodos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setMostrarConfirmacaoPeriodos(false);
              setPeriodoMinimoMarcado(null);
            }}
            style={{ zIndex: 10007 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
              style={{ zIndex: 10008 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirmação</h2>
              <p className="text-gray-600 mb-6">Você já fez todas as matérias dos períodos anteriores?</p>
              <div className="flex gap-4">
                <motion.button onClick={marcarTodasMateriasAnteriores} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Sim
                </motion.button>
                <motion.button onClick={abrirModalMateriasAnteriores} className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Não
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarModalMateriasAnteriores && periodoMinimoMarcado && periodoMinimoMarcado > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
            style={{ zIndex: 10009, pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-4"
              style={{ zIndex: 10010, pointerEvents: 'auto' }}
            >
              <div className="flex items-center justify-between mb-4" onClick={(e) => e.stopPropagation()}>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Matérias dos Períodos Anteriores</h2>
                  <p className="text-sm text-red-600 mt-2 font-medium">⚠️ Marque as matérias que você cursou dos períodos anteriores para uma melhor sugestão</p>
                </div>
                <motion.button
                  onClick={() => {
                    setMostrarModalMateriasAnteriores(false);
                    setPeriodoMinimoMarcado(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >×</motion.button>
              </div>

              <div className="space-y-4 mb-6" onClick={(e) => e.stopPropagation()}>
                {Array.from({ length: periodoMinimoMarcado - 1 }, (_, i) => i + 1).map(periodoNum => {
                  const materiasDoPeriodo = MATERIAS_POR_PERIODO[periodoNum.toString()] || [];
                  if (materiasDoPeriodo.length === 0) return null;
                  return (
                    <div key={periodoNum} className="border-2 border-gray-200 rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
                      <h3 className="text-lg font-bold text-gray-700 mb-3">{periodoNum}º Período</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                        {materiasDoPeriodo.map(m => (
                          <motion.div
                            key={m.codigo}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${materiasConcluidas.includes(m.codigo) ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200 hover:border-indigo-400'}`}
                            onMouseDown={(e) => { e.stopPropagation(); }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleConcluida(m.codigo);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${materiasConcluidas.includes(m.codigo) ? 'bg-green-500 border-green-600' : 'border-gray-300'}`}>
                                {materiasConcluidas.includes(m.codigo) && <span className="text-white text-xs">✓</span>}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-800">{m.nome}</p>
                                <p className="text-xs text-gray-500">{m.codigo}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <motion.button
                onClick={() => {
                  setMostrarModalMateriasAnteriores(false);
                  setPeriodoMinimoMarcado(null);
                  setTimeout(() => { executarCalculo(); }, 50);
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Calcular Possíveis Matérias
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarModalPossiveis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => {
              setMostrarModalPossiveis(false);
              setPeriodoMinimoMarcado(null);
              setMostrarConfirmacaoPeriodos(false);
            }}
            style={{ zIndex: 10001 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
              style={{ zIndex: 10002 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3"
                  >
                    <span className="text-3xl">⭐</span>
                    Matérias Possíveis
                  </motion.h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-2">
                    Matérias que você pode cursar respeitando pré-requisitos
                  </p>
                </div>
                <motion.button
                  onClick={() => {
                    setMostrarModalPossiveis(false);
                    setPeriodoMinimoMarcado(null);
                    setMostrarConfirmacaoPeriodos(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >×</motion.button>
              </div>

              {possiveisMaterias.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white shadow-lg"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm opacity-90">Total de aulas semanais</p>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {possiveisMaterias.reduce((sum, m) => sum + (m.aulasSemanais || 0), 0)} aulas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-90">Total de matérias</p>
                      <p className="text-2xl sm:text-3xl font-bold">{possiveisMaterias.length}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex-1 overflow-y-auto pr-2">
                {possiveisMaterias.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 sm:p-12 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gray-50"
                  >
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-4">📚</motion.div>
                    <p className="text-lg text-gray-600 font-medium">Nenhuma matéria possível no momento</p>
                    <p className="text-sm text-gray-500 mt-2">Marque mais matérias como concluídas para ver opções disponíveis</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {possiveisMaterias.map((m, index) => (
                      <motion.div
                        key={m.codigo}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-pink-50/40 backdrop-blur-sm border-2 border-indigo-200/50 rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-300 relative overflow-hidden group cursor-pointer"
                        whileTap={{ scale: 1 }}
                        onClick={() => abrirDetalhes(m)}
                      >
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm sm:text-base font-semibold flex-1">{m.nome}</h3>
                            <motion.span className="ml-2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-md">
                              {m.semestre}
                            </motion.span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium mb-2">
                            {m.codigo} • {m.carga}
                            {m.aulasSemanais && <span className="ml-2 text-indigo-600 font-semibold">• {m.aulasSemanais} aulas/sem</span>}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{m.descricao}</p>
                          {m.trilha && (
                            <div className="mt-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTrilhaColor(m.trilha)}`}>
                                {m.trilha}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <motion.button
                  onClick={() => {
                    setMostrarModalPossiveis(false);
                    setPeriodoMinimoMarcado(null);
                    setMostrarConfirmacaoPeriodos(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Fechar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// COMPONENTE 4: VIEW DO FLUXOGRAMA (REACT FLOW)
// ==========================================
function FluxogramaView({ todasMaterias, trilhaFiltro, getTrilhaColor, getTrilhaBorderColor, onMateriaClick, getTrilhaColorHex }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [isReady, setIsReady] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width || 1200;
        const height = rect.height || 600;
        
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
          setIsReady(true);
        }
      }
    };

    const timer = setTimeout(updateDimensions, 0);
    
    let resizeObserver;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);
  const materiasFiltradas = useMemo(() => {
    if (!todasMaterias || typeof todasMaterias !== 'object') return [];
    const todas = Object.values(todasMaterias);
    if (todas.length === 0) return [];
    if (!trilhaFiltro) return todas;
    const filtradas = todas.filter(m => m && m.trilha === trilhaFiltro);
    return filtradas.length > 0 ? filtradas : todas;
  }, [todasMaterias, trilhaFiltro]);

  const materiasPorPeriodo = useMemo(() => {
    const grupos = {};
    materiasFiltradas.forEach(m => {
      if (!grupos[m.periodo]) grupos[m.periodo] = [];
      grupos[m.periodo].push(m);
    });
    return grupos;
  }, [materiasFiltradas]);

  const materiasConectadas = useMemo(() => {
    if (!materiaSelecionada) return new Set();
    
    const conectadas = new Set([materiaSelecionada]);
    const materiaSelecionadaObj = materiasFiltradas.find(m => m.codigo === materiaSelecionada);
    
    if (!materiaSelecionadaObj) return conectadas;
    
    if (materiaSelecionadaObj.prepara) {
      materiaSelecionadaObj.prepara.forEach(idPrepara => {
        const m = materiasFiltradas.find(mat => mat.codigo === idPrepara);
        if (m) conectadas.add(m.codigo);
      });
    }
    
    if (materiaSelecionadaObj.requer) {
      materiaSelecionadaObj.requer.forEach(idRequer => {
        const m = materiasFiltradas.find(mat => mat.codigo === idRequer);
        if (m) conectadas.add(m.codigo);
      });
    }
    
    materiasFiltradas.forEach(m => {
      if (m.prepara && m.prepara.includes(materiaSelecionadaObj.codigo)) {
        conectadas.add(m.codigo);
      }
      if (m.requer && m.requer.includes(materiaSelecionadaObj.codigo)) {
        conectadas.add(m.codigo);
      }
    });
    
    return conectadas;
  }, [materiaSelecionada, materiasFiltradas]);

  const nodes = useMemo(() => {
    const periodos = Object.keys(materiasPorPeriodo).map(Number).sort((a, b) => a - b);
    if (periodos.length === 0) return [];

    const nodesList = [];
    
    periodos.forEach((periodo, periodoIdx) => {
      const materias = materiasPorPeriodo[periodo];
      if (!materias || materias.length === 0) return;
      
      const xPos = periodoIdx * 350 + 100;
      const yInicio = 100;
      
      materias.forEach((materia, materiaIdx) => {
        if (!materia || !materia.codigo) return;
        
        const yPos = yInicio + materiaIdx * 180;
        const trilhaBorderColor = materia.trilha ? getTrilhaBorderColor(materia.trilha) : 'border-l-gray-300';
        
        const isConectada = materiasConectadas.has(materia.codigo);
        nodesList.push({
          id: materia.codigo,
          type: 'custom',
          position: { x: xPos, y: yPos },
          data: {
            materia,
            trilhaBorderColor,
            getTrilhaColor,
            materiaSelecionada,
            isConectada,
            onSelecionar: (codigo) => setMateriaSelecionada(codigo === materiaSelecionada ? null : codigo),
            onAbrirDetalhes: (e) => {
              e.stopPropagation();
              onMateriaClick(materia);
            }
          }
        });
      });
    });
    
    return nodesList;
  }, [materiasPorPeriodo, getTrilhaColor, getTrilhaBorderColor, materiaSelecionada, materiasConectadas, onMateriaClick]);

  const edges = useMemo(() => {
    const edgesList = [];
    const addedEdges = new Set();
    const codigosExistentes = new Set(nodes.map(n => n.id));
    
    const isConectadaSelecionada = (source, target) => {
      return materiaSelecionada && (materiasConectadas.has(source) || materiasConectadas.has(target));
    };
    
    materiasFiltradas.forEach((materia) => {
      if (!codigosExistentes.has(materia.codigo)) return;

      // 1. Setas baseadas no "prepara" (Sólida: Vai da origem pro destino)
      if (materia.prepara && materia.prepara.length > 0) {
        materia.prepara.forEach((idPrepara) => {
          const materiaDestino = materiasFiltradas.find(m => m.codigo === idPrepara);
          if (materiaDestino && materiaDestino.periodo > materia.periodo && codigosExistentes.has(materiaDestino.codigo)) {
            const edgeId = `${materia.codigo}-${materiaDestino.codigo}`;
            if (!addedEdges.has(edgeId)) {
              addedEdges.add(edgeId);
              const corSeta = getTrilhaColorHex(materia.trilha);
              const isConectada = isConectadaSelecionada(materia.codigo, materiaDestino.codigo);
              edgesList.push({
                id: edgeId,
                source: materia.codigo,
                target: materiaDestino.codigo,
                type: 'bezier',
                animated: !!isConectada,
                style: { stroke: corSeta, strokeWidth: isConectada ? 4 : 2, opacity: isConectada ? 1 : 0.6 },
                markerEnd: { type: 'arrowclosed', color: corSeta }
              });
            }
          }
        });
      }

      // 2. Setas baseadas no "preRequisito" (Sólida: Puxa de trás pra frente) -> ISSO RESOLVE SEU PROBLEMA
      if (materia.prereq && materia.prereq.length > 0) {
        materia.prereq.forEach((idPre) => {
          const materiaOrigem = materiasFiltradas.find(m => m.codigo === idPre);
          if (materiaOrigem && materiaOrigem.periodo < materia.periodo && codigosExistentes.has(materiaOrigem.codigo)) {
            const edgeId = `${materiaOrigem.codigo}-${materia.codigo}`;
            if (!addedEdges.has(edgeId)) {
              addedEdges.add(edgeId);
              const corSeta = getTrilhaColorHex(materiaOrigem.trilha);
              const isConectada = isConectadaSelecionada(materiaOrigem.codigo, materia.codigo);
              edgesList.push({
                id: edgeId,
                source: materiaOrigem.codigo,
                target: materia.codigo,
                type: 'bezier',
                animated: !!isConectada,
                style: { stroke: corSeta, strokeWidth: isConectada ? 4 : 2, opacity: isConectada ? 1 : 0.6 },
                markerEnd: { type: 'arrowclosed', color: corSeta }
              });
            }
          }
        });
      }
      
      // 3. Setas baseadas no "requer" (Tracejada)
      if (materia.requer && materia.requer.length > 0) {
        materia.requer.forEach((idRequer) => {
          const materiaRequerida = materiasFiltradas.find(m => m.codigo === idRequer);
          if (materiaRequerida && materiaRequerida.periodo < materia.periodo && codigosExistentes.has(materiaRequerida.codigo)) {
            const edgeId = `${materiaRequerida.codigo}-${materia.codigo}`;
            // Só adiciona a tracejada se não existir uma seta Sólida (obrigatória) já traçada ali
            if (!addedEdges.has(edgeId)) {
              addedEdges.add(edgeId);
              const isConectada = isConectadaSelecionada(materiaRequerida.codigo, materia.codigo);
              edgesList.push({
                id: `req-${edgeId}`,
                source: materiaRequerida.codigo,
                target: materia.codigo,
                type: 'bezier',
                animated: !!isConectada,
                style: { stroke: '#60a5fa', strokeWidth: isConectada ? 3 : 1.5, strokeDasharray: '5,5', opacity: isConectada ? 1 : 0.6 },
                markerEnd: { type: 'arrowclosed', color: '#60a5fa' }
              });
            }
          }
        });
      }
    });
    
    return edgesList;
  }, [materiasFiltradas, getTrilhaColorHex, nodes, materiasConectadas, materiaSelecionada]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  if (!isReady) {
    return (
      <div ref={containerRef} style={{ height: '100%', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-gray-500">Carregando fluxograma...</div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '600px' }}>
        {isReady && (
          <div style={{ width: dimensions.width + 'px', height: dimensions.height + 'px', minWidth: '800px', minHeight: '600px' }}>
            <ReactFlow 
              key={trilhaFiltro || 'todas'} /* ISSO MATA OS ARTEFATOS FANTASMAS */
              nodes={nodes} 
              edges={edges} 
              nodeTypes={nodeTypes} 
              fitView 
              fitViewOptions={{ padding: 0.3, minZoom: 0.15, maxZoom: 2.0 }}
              panOnDrag={true}      /* Melhora o touch */
              panOnScroll={true}    /* Melhora o touch */
              zoomOnScroll={false}  /* Evita confusão no touch */
              zoomOnPinch={true}    /* Mantém zoom com 2 dedos */
            >
              <Background color="#e5e7eb" gap={16} />
              <Controls />
            </ReactFlow>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}

// Componente de nó customizado para React Flow
const CustomNode = React.memo(({ data, selected }) => {
  if (!data || !data.materia) return null;

  const { materia, trilhaBorderColor, getTrilhaColor, materiaSelecionada, isConectada, onSelecionar, onAbrirDetalhes } = data;
  const isSelecionada = materiaSelecionada === materia.codigo;

  return (
    <div
      onClick={() => onSelecionar(materia.codigo)}
      className={`bg-white border-l-4 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[220px] cursor-pointer hover:shadow-xl transition-all ${trilhaBorderColor} ${
        isSelecionada ? 'ring-4 ring-indigo-500 ring-offset-2 shadow-2xl scale-105' : isConectada ? 'ring-2 ring-yellow-400 shadow-xl' : ''
      } ${selected ? 'ring-2 ring-indigo-300' : ''}`}
      style={{ 
        borderLeftWidth: '4px',
        textDecoration: isSelecionada ? 'underline' : 'none',
        textDecorationColor: isSelecionada ? getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] ? 
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'blue' ? '#3b82f6' :
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'orange' ? '#f97316' :
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'green' ? '#22c55e' :
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'red' ? '#ef4444' :
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'purple' ? '#a855f7' : '#6b7280'
          : '#6b7280' : 'none',
        textUnderlineOffset: '3px'
      }}
    >
      {/* PONTO DE CHEGADA: Mantido no Topo */}
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-semibold text-xs mb-1 leading-tight">{materia.nome}</div>
          <div className="text-xs text-gray-500 mb-1">{materia.codigo}</div>
          <div className="text-xs text-gray-400 mb-2">{materia.periodo}º Período</div>
          {materia.trilha && (
            <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs border ${getTrilhaColor(materia.trilha)}`}>
              {materia.trilha.length > 18 ? materia.trilha.substring(0, 18) + '...' : materia.trilha}
            </div>
          )}
        </div>
        <button onClick={onAbrirDetalhes} className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded transition-colors whitespace-nowrap" title="Ver detalhes">
          📖
        </button>
      </div>
      
      {/* PONTO DE SAÍDA: Alterado de Position.Bottom para Position.Right */}
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

function PERIODOSText(id) {
  const p = PERIODOS.find((x) => x.id === id);
  return p ? p.label : "—";
}

// ==========================================
// COMPONENTE EXTRA: TELA DE ADMINISTRAÇÃO (VISUAL E AMIGÁVEL)
// ==========================================
function TelaAdmin() {
  const navigate = useNavigate();
  
  // ==========================================
  // ESTADOS DE AUTENTICAÇÃO (LOGIN)
  // ==========================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErro, setLoginErro] = useState("");

  // ==========================================
  // ESTADOS DO PAINEL DE ADMINISTRAÇÃO
  // ==========================================
  const [materias, setMaterias] = useState(() => JSON.parse(JSON.stringify(materiasData)));
  const [materiaSelecionadaId, setMateriaSelecionadaId] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");
  
  const [token, setToken] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const GITHUB_OWNER = "simmjoaooliveira"; 
  const GITHUB_REPO = "seletor-materias-utfpr";
  const GITHUB_FILE_PATH = "src/data/materias.json";

  // Função para validar o Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === "daeln" && loginPass === "1234") {
      setIsAuthenticated(true);
      setLoginErro("");
    } else {
      setLoginErro("Usuário ou senha incorretos.");
    }
  };

  // Se NÃO estiver autenticado, mostra a tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Efeito de fundo bonitinho */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 opacity-50"></div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
            <p className="text-sm text-gray-500 mt-1">Área exclusiva da coordenação</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Usuário</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="Digite o usuário..."
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
            </div>

            {loginErro && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center animate-pulse">
                {loginErro}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all mt-4"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-indigo-600 font-medium transition-colors">
              ← Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CÓDIGO DO PAINEL (Só renderiza se passar do login)
  // ==========================================
  
  const materiaEditando = materias.find(m => m.id === materiaSelecionadaId) || null;

  const materiasFiltradas = materias.filter(m => 
    (m.nome || "").toLowerCase().includes(termoBusca.toLowerCase()) || 
    (m.id || "").toLowerCase().includes(termoBusca.toLowerCase())
  );

  const handleChangeCampo = (campo, valor) => {
    setMaterias(prev => prev.map(m => {
      if (m.id === materiaSelecionadaId) {
        return { ...m, [campo]: valor };
      }
      return m;
    }));
  };

  const handleChangeArray = (campo, valorTexto) => {
    const arrayFormatado = valorTexto.split(',').map(item => item.trim()).filter(Boolean);
    handleChangeCampo(campo, arrayFormatado);
  };

  const formatArrayToString = (valor) => {
    if (!valor) return "";
    if (Array.isArray(valor)) return valor.join(", ");
    return String(valor); // Se for um texto simples, apenas retorna ele
  };

  const handleAdicionarMateria = () => {
    const novaMateria = {
      id: `NOVA_${Date.now().toString().slice(-4)}`,
      nome: "Nova Disciplina",
      periodo: 1,
      ementa: "",
      preRequisito: [],
      prepara: [],
      requer: [],
      trilha: "Interdisciplinar",
      carga: 60,
      aulasSemanais: 4
    };
    setMaterias([novaMateria, ...materias]);
    setMateriaSelecionadaId(novaMateria.id);
  };

  const handleExcluirMateria = () => {
    if(window.confirm(`Tem certeza que deseja excluir ${materiaEditando.nome}?`)) {
      setMaterias(materias.filter(m => m.id !== materiaSelecionadaId));
      setMateriaSelecionadaId(null);
    }
  };

  const handleSalvarNoGithub = async () => {
    if (!token) {
      setStatus({ tipo: 'erro', texto: "⚠️ Insira o Token do GitHub para salvar." });
      return;
    }

    setLoading(true);
    setStatus({ tipo: 'info', texto: "⏳ Conectando ao GitHub..." });

    try {
      const getRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
        headers: { Authorization: `token ${token}` }
      });
      
      if (!getRes.ok) throw new Error("Acesso negado. Verifique o usuário, repositório ou o Token.");
      
      const fileData = await getRes.json();
      const fileSha = fileData.sha;

      const novoConteudoJson = JSON.stringify(materias, null, 2);
      
      // Converte para base64 com suporte a acentos (UTF-8)
      const bytes = new TextEncoder().encode(novoConteudoJson);
      const encodedContent = btoa(String.fromCharCode(...bytes));

      setStatus({ tipo: 'info', texto: "🚀 Enviando atualização..." });
      const putRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Atualização da grade via Painel Admin Visual",
          content: encodedContent,
          sha: fileSha
        }),
      });

      if (!putRes.ok) throw new Error("Erro ao sobrescrever o arquivo no GitHub.");

      setStatus({ tipo: 'sucesso', texto: "✅ Sucesso! O site será atualizado automaticamente em ~2 minutos." });
      
    } catch (error) {
      console.error(error);
      setStatus({ tipo: 'erro', texto: `❌ Erro: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* HEADER DA ADMINISTRAÇÃO */}
      <div className="bg-indigo-700 text-white p-4 shadow-md flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <span>⚙️</span> Painel do Coordenador
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm">Edição visual da Grade Curricular</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Botão de Logout */}
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="px-4 py-2 bg-indigo-800 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* ÁREA DE CONTROLE (TOKEN E BOTÃO SALVAR) */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full flex items-center gap-2">
          <span className="text-xl">🔑</span>
          <input
            type="password"
            placeholder="Cole o Token Clássico do GitHub aqui..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        
        <button
          onClick={handleSalvarNoGithub}
          disabled={loading}
          className={`w-full sm:w-auto px-8 py-2 rounded-lg font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? '⏳ Processando...' : '💾 Publicar Alterações'}
        </button>
      </div>

      {/* FEEDBACK DE STATUS */}
      {status && (
        <div className={`p-3 text-center text-sm font-medium ${status.tipo === 'erro' ? 'bg-red-100 text-red-700' : status.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {status.texto}
        </div>
      )}

      {/* LAYOUT PRINCIPAL: LISTA NA ESQUERDA, FORMULÁRIO NA DIREITA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* COLUNA ESQUERDA: LISTA DE MATÉRIAS */}
        <div className="w-1/3 max-w-sm bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button 
              onClick={handleAdicionarMateria}
              className="w-full mb-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-semibold text-sm transition-colors"
            >
              + Adicionar Nova Disciplina
            </button>
            <input
              type="text"
              placeholder="Buscar disciplina..."
              className="w-full px-3 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm transition-all"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {materiasFiltradas.map(m => (
              <button
                key={m.id}
                onClick={() => setMateriaSelecionadaId(m.id)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors border ${materiaSelecionadaId === m.id ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
              >
                <div className="font-semibold text-gray-800 line-clamp-1">{m.nome}</div>
                <div className="text-xs text-gray-500 flex justify-between mt-1">
                  <span>{m.id}</span>
                  <span>{m.periodo}º Período</span>
                </div>
              </button>
            ))}
            {materiasFiltradas.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-4">Nenhuma matéria encontrada.</p>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO DE EDIÇÃO */}
        <div className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-8">
          {materiaEditando ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Editando Disciplina</h2>
                <button onClick={handleExcluirMateria} className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors">
                  🗑️ Excluir Disciplina
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Linha 1 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código / ID</label>
                  <input type="text" value={materiaEditando.id || ""} onChange={(e) => handleChangeCampo('id', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Disciplina</label>
                  <input type="text" value={materiaEditando.nome || ""} onChange={(e) => handleChangeCampo('nome', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm font-semibold" />
                </div>

                {/* Linha 2 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Período (Número)</label>
                  <input type="number" value={materiaEditando.periodo || ""} onChange={(e) => handleChangeCampo('periodo', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trilha Principal</label>
                  <select value={materiaEditando.trilha || ""} onChange={(e) => handleChangeCampo('trilha', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm">
                    <option value="Matemática e Física">Matemática e Física</option>
                    <option value="Computação">Computação</option>
                    <option value="Eletrônica">Eletrônica</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Biomédica">Biomédica</option>
                    <option value="Interdisciplinar">Interdisciplinar</option>
                  </select>
                </div>

                {/* Linha 3 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Carga Horária Total</label>
                  <input type="number" value={materiaEditando.carga || ""} onChange={(e) => handleChangeCampo('carga', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aulas Semanais</label>
                  <input type="number" value={materiaEditando.aulasSemanais || ""} onChange={(e) => handleChangeCampo('aulasSemanais', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>

                {/* Linha 4 (Ementa Ocupa Tudo) */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ementa</label>
                  <textarea rows="4" value={materiaEditando.ementa || ""} onChange={(e) => handleChangeCampo('ementa', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm resize-none"></textarea>
                </div>

                {/* Linha 5: Relações Ocupam Tudo */}
                <div className="col-span-1 sm:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                  <h3 className="text-sm font-bold text-blue-800 mb-2">🔗 Relações e Setas do Fluxograma</h3>
                  <p className="text-xs text-blue-600 mb-4">Separe os códigos das matérias por vírgula (Ex: OPT031, OPT032).</p>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Pré-Requisitos Obrigatórios (Setas Sólidas)</label>
                    <input type="text" value={formatArrayToString(materiaEditando.preRequisito)} onChange={(e) => handleChangeArray('preRequisito', e.target.value)} placeholder="Ex: EEL1001, EEL2002" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Prepara Para (Matérias Futuras)</label>
                    <input type="text" value={formatArrayToString(materiaEditando.prepara)} onChange={(e) => handleChangeArray('prepara', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Requer Conhecimento De (Seta Tracejada)</label>
                    <input type="text" value={formatArrayToString(materiaEditando.requer)} onChange={(e) => handleChangeArray('requer', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-5xl mb-4">👈</span>
              <p className="text-lg font-medium text-gray-500">Selecione uma disciplina na lista para editar</p>
              <p className="text-sm">Ou adicione uma nova matéria no botão azul.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ROTEAMENTO PRINCIPAL
// ==========================================
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TelaInicial />} />
      <Route path="/selecao_materia" element={<SelecaoPeriodoMaterias />} />
      <Route path="/fluxograma" element={<TelaFluxograma />} />
      <Route path="/admin" element={<TelaAdmin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}