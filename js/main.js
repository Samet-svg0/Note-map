import { personIcon } from "./constants.js";
import elements from "./ui.js";
import { getNoteIcon, getStatus } from "./helpers.js";

// Global Değişkenler
var map;
let clickedCoords;
let layer;

// Localstorage'dan notes keyine sahip elemanları al
let notes = JSON.parse(localStorage.getItem("notes")) || [];

window.navigator.geolocation.getCurrentPosition(
  (e) => {
    // Konum bilgisi paylaşıldığında
    loadMap([e.coords.latitude, e.coords.longitude], "Mevcut Konum");
  },
  (e) => {
    // Konum bilgisi paylaşılmadığında
    loadMap([39.925143, 32.837528], "Varsayılan Konum");
  }
);

// ! Haritayı oluşturan fonksiyon
function loadMap(currentPosition, msg) {
  map = L.map("map", {
    zoomControl: false,
  }).setView(currentPosition, 12);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Zoom araçlarının konumunu belirle
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  // Ekrana basılacak bir katman oluştur
   layer = L.layerGroup().addTo(map);

  // Kullanıcın başlangıç konumuna bir tane marker ekle
  L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(msg);

  // Harita üzerindeki tıklama olaylarını izle

  map.on("click", onMapClick);

  //notlari render edecek fonsiyon
 renderNotes();


 renderMarkers();
}

//!Haritaya tıklanıldığında çalışacak fonksiyon

function onMapClick(e) {
  // Tıklanılan yerin kordinatlarına eriş
  clickedCoords = [e.latlng.lat, e.latlng.lng];

  // Aside'a add classını ekle
  elements.aside.classList.add("add");
}

// ! Form gönderildiğinde çalışacak fonksiyon
elements.form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Form içerisindeki değerlere eriş
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // Bir tane not objesi oluştur

  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCoords,
  };

  // Note dizisine yeni notu ekle
  notes.push(newNote);

  // LocalStorage'a notları kaydet
  localStorage.setItem("notes", JSON.stringify(notes));

  // Formu resetle
  e.target.reset();

  // Aside'ı eski haline çevir

  elements.aside.classList.remove("add");

  renderNotes();

  renderMarkers();
});

// Close btn'e tıklanınca aside'ı tekrardan eski haline çevir
elements.cancelBtn.addEventListener("click", () => {
  elements.aside.classList.remove("add");
});

// Mevcut notları render eden fonksiyon
function renderNotes() {
  // note dizisini dönerek herbir not için bir html oluştur

  const noteCard = notes
    .map((note) => {
      // Tarih ayarlaması
      const date = new Date(note.date).toLocaleDateString("tr", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
       // Status ayarlaması

      return ` <li>
  
            <div>
              <p>${note.title}</p>
              <p>${date}</p>
              <p>${getStatus(note.status)}</p>
            </div>
        
            <div class="icons">
              <i data-id='${
              note.id
            }' class="bi bi-airplane-fill" id="fly-btn"></i>
              <i data-id='${note.id}' class="bi bi-trash" id="delete-btn"></i>
            </div>
          </li>`;
    })
    .join("");

  // İlgili html'i arayüze ekle

  elements.noteList.innerHTML = noteCard;

   // Delete Iconlara Eriş
   document.querySelectorAll("#delete-btn").forEach((btn) => {

   const id = btn.dataset.id;

   

    btn.addEventListener("click", () => {
      deleteNote(id);
    });
   });



   // Fly Iconlara Eriş
  document.querySelectorAll("#fly-btn").forEach((btn) => {
  // Fly Btn'e tıklanınca flyNote fonksiyonunu çalıştır

  btn.addEventListener("click", () => {
    // Fly-btn'in id'sine eriş
    const id = +btn.dataset.id;
    flyToNote(id);
  })
  });
}


// Her not için bir marker render eden fonksiyon
function renderMarkers() {

  layer.clearLayers();

notes.map((note) => {


  // Eklenecek ikonun türüne karar ver
const icon = getNoteIcon(note.status);

  L.marker(note.coords, {icon}).addTo(layer).bindPopup(note.title);
});


}




function deleteNote(id){
  
// Kullanıcıdan onay al
const res = confirm("Not silme işlemini onaylıyor musunuz ?");

// Eğer kullanıcı onayladıysa
  if (res) {
    // İd'si bilinen not'u note dizisinden kaldır
    notes = notes.filter((note) => note.id != id);


     // localestorage'ı güncelle
     localStorage.setItem("notes", JSON.stringify(notes));



       // notları render et
    renderNotes();
    // markerları render et
    renderMarkers();
  }
}

function flyToNote(id) {
 const foundedNote = notes.find((note) => note.id == id);



map.flyTo(foundedNote.coords, 12);
}



// arrowIcon'a tıklanınca çalışacak fonksiyon

elements.arrowIcon.addEventListener("click", () => {
  elements.aside.classList.toggle("hide");
});