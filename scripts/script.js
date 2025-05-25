const UM_DIA_EM_MILISSEGUNDOS = 1000 * 60 * 60 * 24;
const UM_MINUTO_EM_MILISSEGUNDOS = 1000 * 60;

let eventos = {};
let dataAtualCalendario = new Date();
let dataSelecionadaCalendario = new Date();

function carregarEventos() {
    const eventosSalvos = localStorage.getItem('eventosAmorSite');
    if (eventosSalvos) {
        eventos = JSON.parse(eventosSalvos);
    }
}

function salvarEventos() {
    localStorage.setItem('eventosAmorSite', JSON.stringify(eventos));
}

function formatarDataParaChave(data) {
    const d = new Date(data);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

function gerarCalendario(ano, mes) {
    const primeiroDiaMes = new Date(ano, mes, 1);
    const ultimoDiaMes = new Date(ano, mes + 1, 0);
    const numDiasMes = ultimoDiaMes.getDate();
    const diaInicioSemana = primeiroDiaMes.getDay();

    const calendarioGrid = document.getElementById('calendarioGrid');
    calendarioGrid.innerHTML = '';
    document.getElementById('currentMonthYear').textContent = `${primeiroDiaMes.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`;

    for (let i = 0; i < diaInicioSemana; i++) {
        const diaVazio = document.createElement('div');
        diaVazio.classList.add('dia-calendario', 'vazio');
        calendarioGrid.appendChild(diaVazio);
    }

    for (let dia = 1; dia <= numDiasMes; dia++) {
        const diaDiv = document.createElement('div');
        diaDiv.classList.add('dia-calendario');
        diaDiv.textContent = dia;
        const dataAtualIteracao = new Date(ano, mes, dia);
        const chaveData = formatarDataParaChave(dataAtualIteracao);

        diaDiv.setAttribute('data-date', chaveData);

        if (eventos[chaveData] && eventos[chaveData].length > 0) {
            diaDiv.classList.add('has-event');
        }

        const hoje = new Date();
        if (dataAtualIteracao.getFullYear() === hoje.getFullYear() &&
            dataAtualIteracao.getMonth() === hoje.getMonth() &&
            dataAtualIteracao.getDate() === hoje.getDate()) {
            diaDiv.classList.add('hoje');
        }

        diaDiv.addEventListener('click', () => {
            const diaAnteriorSelecionado = document.querySelector('.dia-calendario.selecionado');
            if (diaAnteriorSelecionado) {
                diaAnteriorSelecionado.classList.remove('selecionado');
            }
            diaDiv.classList.add('selecionado');
            dataSelecionadaCalendario = dataAtualIteracao;
            exibirEventosDoDia(dataAtualIteracao);
        });

        calendarioGrid.appendChild(diaDiv);
    }
}

function exibirEventosDoDia(data) {
    const listaEventos = document.getElementById('listaEventos');
    listaEventos.innerHTML = '';
    document.getElementById('dataEventoSelecionado').textContent = data.toLocaleDateString('pt-BR');
    const chaveData = formatarDataParaChave(data);

    if (eventos[chaveData] && eventos[chaveData].length > 0) {
        eventos[chaveData].sort((a, b) => {
            if (!a.hora && !b.hora) return 0;
            if (!a.hora) return 1;
            if (!b.hora) return -1;
            return a.hora.localeCompare(b.hora);
        });

        eventos[chaveData].forEach((evento, index) => {
            const li = document.createElement('li');
            li.textContent = `${evento.hora ? evento.hora + ' - ' : ''}${evento.nome}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.classList.add('delete-event');
            deleteButton.onclick = () => {
                eventos[chaveData].splice(index, 1);
                if (eventos[chaveData].length === 0) {
                    delete eventos[chaveData];
                    const diaDiv = document.querySelector(`.dia-calendario[data-date="${chaveData}"]`);
                    if (diaDiv) diaDiv.classList.remove('has-event');
                }
                salvarEventos();
                exibirEventosDoDia(data);
                gerarCalendario(dataAtualCalendario.getFullYear(), dataAtualCalendario.getMonth());
            };
            li.appendChild(deleteButton);
            listaEventos.appendChild(li);
        });
    } else {
        const noEventsP = document.createElement('p');
        noEventsP.classList.add('no-events');
        noEventsP.textContent = 'Nenhum evento para este dia.';
        listaEventos.appendChild(noEventsP);
    }
}

function adicionarEvento() {
    const inputEvento = document.getElementById('inputEvento');
    const inputHora = document.getElementById('inputHoraEvento');
    const nomeEvento = inputEvento.value.trim();
    const horaEvento = inputHora.value;

    if (nomeEvento && dataSelecionadaCalendario) {
        const chaveData = formatarDataParaChave(dataSelecionadaCalendario);
        if (!eventos[chaveData]) {
            eventos[chaveData] = [];
        }

        eventos[chaveData].push({
            nome: nomeEvento,
            hora: horaEvento
        });

        salvarEventos();
        exibirEventosDoDia(dataSelecionadaCalendario);
        inputEvento.value = '';
        inputHora.value = '';
        gerarCalendario(dataAtualCalendario.getFullYear(), dataAtualCalendario.getMonth());
    } else if (!nomeEvento) {
        alert('Por favor, digite o nome do evento.');
    } else if (!dataSelecionadaCalendario) {
        alert('Por favor, selecione uma data no calendário primeiro.');
    }
}

function verificarNotificacoes() {
    const agora = new Date();
    const hojeChave = formatarDataParaChave(agora);
    let notificacoesDisparadas = localStorage.getItem('notificacoesDisparadas') || '{}';
    notificacoesDisparadas = JSON.parse(notificacoesDisparadas);

    for (const chaveData in eventos) {
        const dataEventoObj = new Date(chaveData + 'T00:00:00');
        dataEventoObj.setHours(0, 0, 0, 0);

        const diffDias = Math.ceil((dataEventoObj.getTime() - agora.setHours(0,0,0,0)) / UM_DIA_EM_MILISSEGUNDOS);
        const agoraComHora = new Date();

        if (diffDias >= 0 && diffDias <= 7) {
            eventos[chaveData].forEach(evento => {
                const eventoUnicoId = `${chaveData}-${evento.nome}-${evento.hora}`;

                if (notificacoesDisparadas[eventoUnicoId]) {
                    return;
                }

                let mensagem = `Lembrete: O evento "${evento.nome}" está `;

                if (diffDias === 0) {
                    if (evento.hora) {
                        const [h, m] = evento.hora.split(':').map(Number);
                        const dataComHoraEvento = new Date(agoraComHora.getFullYear(), agoraComHora.getMonth(), agoraComHora.getDate(), h, m, 0, 0);

                        if (dataComHoraEvento.getTime() >= agoraComHora.getTime() - UM_MINUTO_EM_MILISSEGUNDOS * 5 && dataComHoraEvento.getTime() <= agoraComHora.getTime() + UM_MINUTO_EM_MILISSEGUNDOS * 15) {
                            mensagem += `acontecendo AGORA ou em breve (${evento.hora})!`;
                            alert(mensagem);
                            notificacoesDisparadas[eventoUnicoId] = true;
                        }
                    } else {
                        mensagem += `acontecendo HOJE!`;
                        alert(mensagem);
                        notificacoesDisparadas[eventoUnicoId] = true;
                    }
                } else if (diffDias === 1) {
                    mensagem += `amanhã${evento.hora ? ' às ' + evento.hora : ''}!`;
                    alert(mensagem);
                    notificacoesDisparadas[eventoUnicoId] = true;
                } else {
                    mensagem += `em ${diffDias} dias${evento.hora ? ' às ' + evento.hora : ''}!`;
                    alert(mensagem);
                    notificacoesDisparadas[eventoUnicoId] = true;
                }
            });
        }
    }
    localStorage.setItem('notificacoesDisparadas', JSON.stringify(notificacoesDisparadas));
}

document.addEventListener('DOMContentLoaded', () => {
    carregarEventos();
    verificarNotificacoes();
    atualizarContadorPrincipal();

    const botaoCartaPrincipal = document.getElementById('botaoCartaPrincipal');
    const botaoCartaNamorados = document.getElementById('botaoCartaNamorados');
    const botaoCartaAlianca = document.getElementById('botaoCartaAlianca');
    const botaoCalendario = document.getElementById('botaoCalendario');

    botaoCartaPrincipal.onclick = function() {
        const dataDoisAnosNamoro = new Date('2025-09-09T00:00:00');
        if (new Date().getTime() - dataDoisAnosNamoro.getTime() >= 0) {
            window.open('carta.html', '_blank');
        } else {
            alert('Sua carta especial de 2 anos estará disponível no dia 09 de setembro de 2025! ❤️');
        }
    };

    botaoCartaNamorados.onclick = function() {
        const dataDiaDosNamorados = new Date('2025-06-12T00:00:00');
        if (new Date().getTime() - dataDiaDosNamorados.getTime() >= 0) {
            window.open('carta_namorados.html', '_blank');
        } else {
            alert('A carta do Dia dos Namorados estará disponível no dia 12 de junho de 2025! 💖');
        }
    };

    botaoCartaAlianca.onclick = function() {
        const dataUmAnoAlianca = new Date('2025-06-15T00:00:00');
        if (new Date().getTime() - dataUmAnoAlianca.getTime() >= 0) {
            window.open('carta_alianca.html', '_blank');
        } else {
            alert('A carta de 1 ano de aliança estará disponível no dia 15 de junho de 2025! 💍');
        }
    };

    const modalCalendario = document.getElementById('modalCalendario');
    const fecharModalCalendario = document.getElementById('fecharModalCalendario');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const adicionarEventoBtn = document.getElementById('adicionarEvento');

    botaoCalendario.onclick = function() {
        modalCalendario.style.display = 'flex';
        dataAtualCalendario = new Date();
        gerarCalendario(dataAtualCalendario.getFullYear(), dataAtualCalendario.getMonth());
        dataSelecionadaCalendario = new Date();
        const hojeDiv = document.querySelector(`.dia-calendario.hoje`);
        if (hojeDiv) {
            const diaAnteriorSelecionado = document.querySelector('.dia-calendario.selecionado');
            if (diaAnteriorSelecionado) {
                diaAnteriorSelecionado.classList.remove('selecionado');
            }
            hojeDiv.classList.add('selecionado');
        }
        exibirEventosDoDia(dataSelecionadaCalendario);
    };

    fecharModalCalendario.onclick = function() {
        modalCalendario.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === modalCalendario) {
            modalCalendario.style.display = 'none';
        }
    };

    prevMonthBtn.onclick = () => {
        dataAtualCalendario.setMonth(dataAtualCalendario.getMonth() - 1);
        gerarCalendario(dataAtualCalendario.getFullYear(), dataAtualCalendario.getMonth());
        exibirEventosDoDia(dataSelecionadaCalendario);
    };

    nextMonthBtn.onclick = () => {
        dataAtualCalendario.setMonth(dataAtualCalendario.getMonth() + 1);
        gerarCalendario(dataAtualCalendario.getFullYear(), dataAtualCalendario.getMonth());
        exibirEventosDoDia(dataSelecionadaCalendario);
    };

    adicionarEventoBtn.onclick = adicionarEvento;
    document.getElementById('inputEvento').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            adicionarEvento();
        }
    });

    setInterval(verificarNotificacoes, UM_MINUTO_EM_MILISSEGUNDOS * 5);
    setInterval(atualizarContadorPrincipal, 1000);
});

function atualizarContadorPrincipal() {
    const dataInicioNamoro = new Date('2023-09-09T00:00:00');
    const dataDoisAnosNamoro = new Date('2025-09-09T00:00:00');
    const dataDiaDosNamorados = new Date('2025-06-12T00:00:00');
    const dataUmAnoAlianca = new Date('2025-06-15T00:00:00');
    const dataAtual = new Date();

    const elementoMensagem = document.querySelector('.mensagem');
    const elementoContador = document.getElementById('contador');
    const coracoes = document.querySelectorAll('.coracao');

    elementoContador.style.display = 'block';
    elementoMensagem.classList.remove('animar-mensagem');
    coracoes.forEach(coracao => {
        coracao.style.opacity = 0;
        coracao.innerHTML = '';
    });

    const fimDoContador = new Date(dataDoisAnosNamoro);
    fimDoContador.setHours(23, 59, 59, 999);

    if (dataAtual.getTime() > fimDoContador.getTime()) {
        elementoContador.style.display = 'none';
        elementoMensagem.textContent = 'Eu te amo!';
        elementoMensagem.classList.add('animar-mensagem');
        coracoes.forEach(coracao => {
            coracao.style.opacity = 1;
            coracao.innerHTML = '💖';
        });
        return;
    }

    const diaNamoradosHoje = (dataAtual.getDate() === dataDiaDosNamorados.getDate() &&
                             dataAtual.getMonth() === dataDiaDosNamorados.getMonth() &&
                             dataAtual.getFullYear() === dataDiaDosNamorados.getFullYear());

    if (diaNamoradosHoje) {
        elementoMensagem.textContent = 'Feliz Dia dos Namorados! 💖';
        elementoMensagem.classList.add('animar-mensagem');
        coracoes.forEach(coracao => {
            coracao.style.opacity = 1;
            coracao.innerHTML = '💖';
        });
        elementoContador.style.display = 'none';
        return;
    }

    const diaAliancaHoje = (dataAtual.getDate() === dataUmAnoAlianca.getDate() &&
                            dataAtual.getMonth() === dataUmAnoAlianca.getMonth() &&
                            dataAtual.getFullYear() === dataUmAnoAlianca.getFullYear());

    if (diaAliancaHoje) {
        elementoMensagem.textContent = 'Feliz 1 Ano de Aliança! 💍';
        elementoMensagem.classList.add('animar-mensagem');
        coracoes.forEach(coracao => {
            coracao.style.opacity = 1;
            coracao.innerHTML = '✨';
        });
        elementoContador.style.display = 'none';
        return;
    }

    const diferencaInicioNamoro = dataAtual.getTime() - dataInicioNamoro.getTime();
    const diferencaDoisAnosNamoro = dataDoisAnosNamoro.getTime() - dataAtual.getTime();

    if (diferencaDoisAnosNamoro <= 0) {
        elementoMensagem.textContent = 'Feliz 2 anos, meu amor! ✨';
        elementoMensagem.classList.add('animar-mensagem');
        coracoes.forEach(coracao => {
            coracao.style.opacity = 1;
            coracao.innerHTML = '💖';
        });
        elementoContador.style.display = 'none';
    } else {
        const diasRestantesNamoro = Math.ceil(diferencaDoisAnosNamoro / UM_DIA_EM_MILISSEGUNDOS);
        elementoMensagem.textContent = `Faltam ${diasRestantesNamoro} dias para 2 anos!`;
        elementoMensagem.classList.remove('animar-mensagem');
        coracoes.forEach(coracao => {
            coracao.style.opacity = 0;
            coracao.innerHTML = '';
        });
        elementoContador.style.display = 'block';
    }

    const segundos = Math.floor((diferencaInicioNamoro / 1000) % 60);
    const minutos = Math.floor((diferencaInicioNamoro / (1000 * 60)) % 60);
    const horas = Math.floor((diferencaInicioNamoro / (1000 * 60 * 60)) % 24);

    let diffAnos = dataAtual.getFullYear() - dataInicioNamoro.getFullYear();
    let diffMeses = dataAtual.getMonth() - dataInicioNamoro.getMonth();
    let diffDias = dataAtual.getDate() - dataInicioNamoro.getDate();

    if (diffDias < 0) {
        diffMeses--;
        const ultimoDiaMesAnterior = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 0).getDate();
        diffDias = ultimoDiaMesAnterior + diffDias;
    }

    if (diffMeses < 0) {
        diffAnos--;
        diffMeses = 12 + diffMeses;
    }

    document.getElementById('anos').textContent = diffAnos;
    document.getElementById('meses').textContent = diffMeses;
    document.getElementById('dias').textContent = diffDias;
    document.getElementById('horas').textContent = horas;
    document.getElementById('minutos').textContent = minutos;
    document.getElementById('segundos').textContent = segundos;
}