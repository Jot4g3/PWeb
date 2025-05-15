document.getElementById("btnSendForm")?.addEventListener("click", () => {
    //Os valores dos campos devem ser pegues no evento do clique.
    var vApelido = document.getElementById("tfApelidoIn").value;
    var vEmail = document.getElementById("tfEmailIn").value;
    var vSenha = document.getElementById("tfSenhaIn").value;

    var formPreenchido = (vApelido != "" && vEmail != "" && vSenha != "")

    if (formPreenchido) {
        Swal.fire({
            title: `Bem-vindo, ${vApelido}!`,
            text: 'Obrigado por enviar seus dados.',
            icon: 'success'
        }).then(() => {
            // Redireciona para a rota com o apelido como parâmetro
            window.location.href = `/users/signin/${encodeURIComponent(vApelido)}`;
        });
    } else {
        Swal.fire({
            title: `Erro`,
            text: 'Você não preencheu o formulário corretamente. Tente outra vez!',
            icon: 'error'
        });
    }
});
