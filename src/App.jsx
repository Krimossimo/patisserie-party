import { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const PATISSERIES = [
  "ROYAULTY", "ROSE ET VERT", "VIRGIN MOJITO", "FORET NOIR", 
  "POIRIÉ", "ABRICOTIER", "LE GOURMAND", "PASSION FRAISE", "FIGUE ASSIDULÉ"
];

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState('form'); // 'form', 'success', 'admin'
  const [results, setResults] = useState([]);
  
  const [formData, setFormData] = useState(
    PATISSERIES.reduce((acc, patisserie) => ({
      ...acc,
      [patisserie]: { esthetique: '', gout: '', prix: '' }
    }), {})
  );

  const handleInputChange = (patisserie, field, value) => {
    setFormData(prev => ({
      ...prev,
      [patisserie]: { ...prev[patisserie], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "degustations"), {
        timestamp: new Date(),
        reponses: formData
      });
      setView('success');
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue.");
    }
    setIsSubmitting(false);
  };

  const fetchResults = async () => {
    const querySnapshot = await getDocs(collection(db, "degustations"));
    const data = querySnapshot.docs.map(doc => doc.data().reponses);
    setResults(data);
    setView('admin');
  };

  const calculerMoyenne = (patisserie) => {
    const prixValides = results
      .map(r => parseFloat(r[patisserie]?.prix))
      .filter(p => !isNaN(p) && p > 0);
    
    if (prixValides.length === 0) return "0.00";
    const total = prixValides.reduce((sum, prix) => sum + prix, 0);
    return (total / prixValides.length).toFixed(2);
  };

  const exporterExcel = () => {
    // 1. Préparer les données brutes
    const donneesBrutes = [];
    results.forEach((reponse, index) => {
      PATISSERIES.forEach(p => {
        if (reponse[p] && (reponse[p].esthetique || reponse[p].gout || reponse[p].prix)) {
          donneesBrutes.push({
            "Invité": `Invité ${index + 1}`,
            "Pâtisserie": p,
            "Esthétique": reponse[p].esthetique,
            "Goût": reponse[p].gout,
            "Prix Estimé (€)": parseFloat(reponse[p].prix) || 0
          });
        }
      });
    });

    // 2. Préparer les moyennes
    const donneesMoyennes = PATISSERIES.map(p => ({
      "Pâtisserie": p,
      "Prix Moyen Estimé (€)": parseFloat(calculerMoyenne(p))
    }));

    // 3. Créer le fichier Excel avec deux onglets
    const wb = XLSX.utils.book_new();
    
    const wsMoyennes = XLSX.utils.json_to_sheet(donneesMoyennes);
    XLSX.utils.book_append_sheet(wb, wsMoyennes, "Moyennes des Prix");

    const wsBrutes = XLSX.utils.json_to_sheet(donneesBrutes);
    XLSX.utils.book_append_sheet(wb, wsBrutes, "Données Brutes");

    // 4. Lancer le téléchargement
    XLSX.writeFile(wb, "Retours_Degustation_Patisseries.xlsx");
  };

  if (view === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white/90 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-[#ac6362] mb-4">Merci !</h1>
        <p className="text-gray-700 text-lg mb-8">Vos retours gourmands ont bien été envoyés.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#ac6362] text-white rounded-xl font-bold shadow-md">
          Nouvelle saisie
        </button>
      </div>
    );
  }

if (view === 'admin') {
    return (
      <div className="min-h-screen p-4 sm:p-8 bg-white/95 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setView('form')} className="text-gray-500 underline font-bold">
            ← Retour
          </button>
          
          <button 
            onClick={exporterExcel} 
            className="px-4 py-2 bg-[#b96b6b] text-white rounded-lg font-bold shadow-md hover:bg-[#9c5959] transition-colors"
          >
            📥 Télécharger le tableau Excel
          </button>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-[#ac6362] mb-8">Résultats des estimations</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {PATISSERIES.map(p => (
            <div key={p} className="bg-white p-6 rounded-2xl shadow-sm border border-[#e8c9c7]">
              <h2 className="font-bold text-lg mb-2 text-gray-800">{p}</h2>
              <p className="text-3xl font-black text-[#ac6362]">{calculerMoyenne(p)} €</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    // Suppression du overflow-x-auto, on bloque la largeur max pour mobile (max-w-2xl)
    <div className="min-h-screen relative pb-24">
      
      {/* Zone cliquable cachée pour l'admin */}
      <button 
        onDoubleClick={fetchResults} 
        className="absolute top-0 right-0 w-16 h-16 opacity-0 z-50"
      ></button>

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        
        <h1 
          className="text-center text-4xl sm:text-5xl font-black mb-8 mt-4 tracking-widest" 
          style={{ color: '#b96b6b' }}
        >
          PÂTISSERIES
        </h1>

        <div className="space-y-10">
          {PATISSERIES.map((p) => (
            <div key={p} className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-[#e8c9c7] overflow-hidden">
              
              {/* En-tête de la carte avec le nom de la pâtisserie */}
              <div className="bg-[#b96e6d] text-white text-center font-bold text-xl py-4 tracking-wider">
                {p}
              </div>

              <div className="p-5 space-y-6">
                
                {/* ESTHÉTIQUE */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#d2aba5] w-2 h-6 rounded-full"></span>
                    <h3 className="font-bold text-[#b96e6d]">ESTHÉTIQUE</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 font-medium leading-relaxed">
                    Trouvez-vous le chic/élégant, casual/basique, trop chargé/cheap ? Cohérent avec les saveurs ? Est-ce soigné ? Que préférez-vous et que changeriez-vous ?
                  </p>
                  <textarea
                    className="w-full h-28 bg-[#ead6d2] rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-[#b96e6d] resize-none text-sm text-gray-800"
                    placeholder="Votre avis sur le visuel..."
                    value={formData[p].esthetique}
                    onChange={(e) => handleInputChange(p, 'esthetique', e.target.value)}
                  />
                </div>

                {/* GOÛT */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#e6b981] w-2 h-6 rounded-full"></span>
                    <h3 className="font-bold text-[#d49668]">GOÛT</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 font-medium leading-relaxed">
                    Textures (moelleux, croustillant...), saveurs (sucré, salé) et équilibre. Qu'avez-vous préféré, moins aimé et pourquoi ?
                  </p>
                  <textarea
                    className="w-full h-28 bg-[#f3e5ce] rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-[#e6b981] resize-none text-sm text-gray-800"
                    placeholder="Votre avis sur les saveurs..."
                    value={formData[p].gout}
                    onChange={(e) => handleInputChange(p, 'gout', e.target.value)}
                  />
                </div>

                {/* PRIX */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#d49668] w-2 h-6 rounded-full"></span>
                    <h3 className="font-bold text-[#b96e6d]">PRIX</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 font-medium">
                    Combien seriez-vous prêt à mettre dans cette pâtisserie ?
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.10"
                      className="w-full h-14 bg-[#e6b999] rounded-xl p-3 pl-12 border-none outline-none focus:ring-2 focus:ring-[#d49668] font-bold text-lg text-gray-800 placeholder-gray-600/50"
                      placeholder="0.00"
                      value={formData[p].prix}
                      onChange={(e) => handleInputChange(p, 'prix', e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 font-bold text-xl">€</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton de soumission flottant */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] flex justify-center z-50">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full max-w-sm py-4 bg-[#b96b6b] text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-[#9c5959] active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer mes réponses'}
        </button>
      </div>

    </div>
  );
}