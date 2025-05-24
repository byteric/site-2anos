function atualizarContador() {
    const dataInicioNamoro = new Date('2023-09-09T00:00:00');
    const dataDoisAnosNamoro = new Date('2025-09-09T00:00:00');
    const dataDiaDosNamorados = new Date('2025-06-12T00:00:00');
    const dataUmAnoAlianca = new Date('2025-06-15T00:00:00');
    const dataAtual = new Date();

    const diferencaInicioNamoro = dataAtual.getTime() - dataInicioNamoro.getTime();
    const diferencaDoisAnosNamoro = dataDoisAnosNamoro.getTime() - dataAtual.getTime();
    const diferencaDiaDosNamorados = dataDiaDosNamorados.getTime() - dataAtual.getTime();
    const diferencaUmAnoAlianca = dataUmAnoAlianca.getTime() - dataAtual.getTime();

    const elementoMensagem = document.querySelector('.mensagem');
    const elementoContador = document.getElementById('contador');
    const botaoCartaPrincipal = document.getElementById('botaoCartaPrincipal');
    const botaoCartaNamorados = document.getElementById('botaoCartaNamorados');
    const botaoCartaAlianca = document.getElementById('botaoCartaAlianca');
    const coracoes = document.querySelectorAll('.coracao');

    botaoCartaPrincipal.onclick = function() {
        if (diferencaDoisAnosNamoro <= 0) {
            window.open('carta.html', '_blank');
        } else {
            alert('Sua carta especial de 2 anos estará disponível no dia 09 de setembro de 2025! ❤️');
        }
    };

    botaoCartaNamorados.onclick = function() {
        if (diferencaDiaDosNamorados <= 0) {
            window.open('carta_namorados.html', '_blank');
        } else {
            alert('A carta do Dia dos Namorados estará disponível no dia 12 de junho de 2025! 💖');
        }
    };

    botaoCartaAlianca.onclick = function() {
        if (diferencaUmAnoAlianca <= 0) {
            window.open('carta_alianca.html', '_blank');
        } else {
            alert('A carta de 1 ano de aliança estará disponível no dia 15 de junho de 2025! 💍');
        }
    };

    if (diferencaDoisAnosNamoro <= 0) {
        elementoMensagem.textContent = 'Feliz 2 anos, meu amor! ✨';
        elementoMensagem.classList.add('animar-mensagem');
        coracoes.forEach(coracao => {
            coracao.style.opacity = 1;
            coracao.innerHTML = '💖';
        });
        elementoContador.style.display = 'none';
    } else {
        const diasRestantesNamoro = Math.ceil(diferencaDoisAnosNamoro / (1000 * 60 * 60 * 24));
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

setInterval(atualizarContador, 1000);
atualizarContador();