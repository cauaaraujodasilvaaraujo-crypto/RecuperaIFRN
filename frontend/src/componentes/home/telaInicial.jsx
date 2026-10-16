import { useEffect, useState } from "react";

import "./telaInicial.css";

// Página provisória: só prova que o login e o token estão funcionando.
// Depois vira a tela de itens (lista, busca, cadastro de item...).
function Home() {

  return (<>
    <main>
      <div className="container">
        <h1>RecuperaIFRN</h1>
        <p>O sistema de Achados e Perdidos oficial do seu campus.</p>
        <p>Perdeu alguma coisa ou encontrou algo no campus? Acesse o sistema!</p>
        
        <a href="login" className="btn btn-login">Entrar (Login)</a>
        <a href="cadastro" className="btn btn-cadastro">Criar Cadastro</a>
    </div>
    </main>
    </>
  );
}

export default Home;
