function atualizarContador() {
    const dataInicio = new Date('2023-09-09T00:00:00'); // Data de INÍCIO do namoro
    const dataDoisAnos = new Date('2025-09-09T00:00:00'); // Data de 2 anos de namoro
    const dataAtual = new Date();
    const diferencaInicio = dataAtual.getTime() - dataInicio.getTime();
    const diferencaDoisAnos = dataDoisAnos.getTime() - dataAtual.getTime();

    const elementoMensagem = document.querySelector('.mensagem');
    const elementoContador = document.getElementById('contador');
    const botaoCarta = document.getElementById('botaoCarta');

    botaoCarta.addEventListener('click', function() {
        if (diferencaDoisAnos <= 0) {
            // Já chegou ou passou dos 2 anos, abre a carta
            window.open('carta.html', '_blank');
        } else {
            // Ainda não chegou a data, mostra a mensagem
            alert('Sua carta especial estará disponível no dia 09 de setembro de 2025! ❤️');
        }
    });

    if (diferencaDoisAnos <= 0) {
        // Já chegou ou passou dos 2 anos
        elementoMensagem.textContent = 'Feliz 2 anos, meu amor! ❤️';
        elementoMensagem.classList.add('animar-mensagem'); // Adiciona classe para ativar a animação
        const coracoes = document.querySelectorAll('.coracao');
        coracoes.forEach(coracao => coracao.style.opacity = 1);
        elementoContador.style.display = 'none'; // Oculta o contador
        atualizarTempoJuntos(diferencaInicio); // Exibe o tempo total juntos
    } else {
        // Contagem regressiva para 2 anos
        const dias = Math.ceil(diferencaDoisAnos / (1000 * 60 * 60 * 24));
        elementoMensagem.textContent = `Contagem regressiva para 2 anos: ${dias} dias`;
        elementoMensagem.classList.remove('animar-mensagem'); // Remove a classe de animação
        const coracoes = document.querySelectorAll('.coracao');
        coracoes.forEach(coracao => coracao.style.opacity = 0); // Oculta os corações
        elementoContador.style.display = 'block'; // Mostra o contador
        atualizarTempoJuntos(diferencaInicio); // Exibe o tempo total juntos até agora
    }
}

function atualizarTempoJuntos(diferenca) {
    const segundos = Math.floor((diferenca / 1000) % 60);
    const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const meses = Math.floor(dias / 30.44);
    const anos = Math.floor(meses / 12);

    document.getElementById('anos').textContent = anos;
    document.getElementById('meses').textContent = meses % 12;
    document.getElementById('dias').textContent = Math.floor(dias % 30.44);
    document.getElementById('horas').textContent = horas;
    document.getElementById('minutos').textContent = minutos;
    document.getElementById('segundos').textContent = segundos;
}

// Atualiza o contador a cada segundo
setInterval(atualizarContador, 1000);

// Chama a função uma vez para exibir o valor inicial imediatamente
atualizarContador();