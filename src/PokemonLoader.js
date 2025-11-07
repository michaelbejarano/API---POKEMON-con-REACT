// src/PokemonLoader.js
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 24;

function PokemonLoader() {
  const [pokemons, setPokemons] = useState([]);
  const [nextUrl, setNextUrl] = useState(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}`);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [typesList, setTypesList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // === Cargar tipos ===
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/type")
      .then(res => res.json())
      .then(data => {
        if (data.results) setTypesList(data.results.map(t => t.name));
      })
      .catch(() => {});
  }, []);

  // === Cargar primeros ===
  useEffect(() => {
    if (nextUrl) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMore() {
    if (!nextUrl) return;
    setLoading(true);
    try {
      const res = await fetch(nextUrl);
      const data = await res.json();
      setNextUrl(data.next);

      const details = await Promise.all(
        data.results.map(r =>
          fetch(r.url).then(resp => resp.json()).catch(() => null)
        )
      );

      const cleaned = details.filter(Boolean).map(d => ({
        id: d.id,
        name: d.name,
        sprite: d.sprites?.other?.["official-artwork"]?.front_default || d.sprites?.front_default,
        types: d.types.map(t => t.type.name),
        weight: d.weight,
        height: d.height,
        base_experience: d.base_experience,
        abilities: d.abilities.map(a => a.ability.name),
        stats: d.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
      }));

      setPokemons(prev => [...prev, ...cleaned]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // === Filtros ===
  const filtered = pokemons.filter(p => {
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (typeFilter && !p.types.includes(typeFilter)) return false;
    return true;
  });

  // === Modal de detalle ===
  const closeModal = () => setSelectedPokemon(null);

  return (
    <section className="pokemon-section container">
      <div className="controls">
        <input
          className="search-input"
          placeholder="Buscar por nombre (ej: pikachu)"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select
          className="type-select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {typesList.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          className="btn-clear"
          onClick={() => {
            setQuery("");
            setTypeFilter("");
          }}
        >
          Limpiar
        </button>
      </div>

      <div className="grid">
        {filtered.map((p, index) => (
          <motion.article
            key={p.id}
            className="poke-card"
            style={{ animationDelay: `${index * 60}ms` }}
            whileHover={{ scale: 1.05, y: -6 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPokemon(p)}
          >
            <motion.div
              className="card-inner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <div className="card-front">
                <div className={`poke-art ${p.types[0] || ""}`}>
                  {p.sprite ? (
                    <motion.img
                      src={p.sprite}
                      alt={p.name}
                      whileHover={{ scale: 1.2, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    />
                  ) : (
                    <div className="no-img">?</div>
                  )}
                </div>
                <h3 className="poke-name">{p.name}</h3>
                <div className="types">
                  {p.types.map(t => (
                    <span key={t} className={`type-pill ${t}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.article>
        ))}
      </div>

      <div className="load-more-wrap">
        {nextUrl ? (
          <button className="btn-load-more" onClick={loadMore} disabled={loading}>
            {loading ? "Cargando..." : "Cargar más Pokémon"}
          </button>
        ) : (
          <div className="end-msg">Has llegado al final 🏁</div>
        )}
      </div>

      {/* === MODAL DETALLE === */}
      <AnimatePresence>
        {selectedPokemon && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="modal-content"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <img src={selectedPokemon.sprite} alt={selectedPokemon.name} className="modal-img" />
              <h2>{selectedPokemon.name}</h2>
              <div className="modal-types">
                {selectedPokemon.types.map(t => (
                  <span key={t} className={`type-pill ${t}`}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="modal-info">
                <p><strong>Peso:</strong> {selectedPokemon.weight}</p>
                <p><strong>Altura:</strong> {selectedPokemon.height}</p>
                <p><strong>Experiencia:</strong> {selectedPokemon.base_experience}</p>
                <p><strong>Habilidades:</strong> {selectedPokemon.abilities.join(", ")}</p>
              </div>

              <div className="modal-stats">
                <h4>Estadísticas base</h4>
                <ul>
                  {selectedPokemon.stats.map(s => (
                    <li key={s.name}>
                      <span>{s.name}</span>
                      <div className="stat-bar">
                        <div
                          className="stat-fill"
                          style={{ width: `${Math.min(s.value, 100)}%` }}
                        ></div>
                      </div>
                      <span className="stat-val">{s.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="modal-close" onClick={closeModal}>
                ✖
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default PokemonLoader;
