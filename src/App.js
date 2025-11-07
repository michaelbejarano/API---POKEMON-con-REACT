// src/App.js
import React from "react";
import "./App.css";
import PokemonLoader from "./PokemonLoader";

function App() {
  return (
    <div className="App pokemon-theme">
      <header className="app-header">
        <div className="logo-wrap">
          <div className="poke-logo">Poké</div>
          <h1 className="title">Pokedex Visual — ¡Explora Pokémon!</h1>
        </div>
        <p className="subtitle">Busca por nombre, filtra por tipo y carga más — con animaciones épicas.</p>
      </header>

      <main className="app-main">
        <PokemonLoader />
      </main>

   
    </div>
  );
}

export default App;
