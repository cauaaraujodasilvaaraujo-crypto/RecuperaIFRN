
import { useEffect, useState } from "react";

import "./tela2.css";

// Página provisória: só prova que o login e o token estão funcionando.
// Depois vira a tela de itens (lista, busca, cadastro de item...).
function Home() {

  return (<>
    <main>
      <div className="container">
        <h1>RecuperaIFRN</h1>
        <p>O sistema de Achados e Perdidos oficial do seu campus.</p>
        <p></p>
        
        <a href="login" className="btn btn-login">Cadrastrar Item</a>
        <a href="cadastro" className="btn btn-cadastro">Procurar Item</a>
    </div>
    </main>
    </>
  );
}

export default Home;
