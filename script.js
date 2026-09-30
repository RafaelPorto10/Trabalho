const books=[
{id:1,title:"Dom Casmurro",author:"Machado de Assis",category:"Literatura",color:"#7b4f3d",available:true},
{id:2,title:"O Pequeno Príncipe",author:"Antoine de Saint-Exupéry",category:"Infantil",color:"#b78a3b",available:true},
{id:3,title:"1984",author:"George Orwell",category:"Distopia",color:"#465b68",available:true},
{id:4,title:"Harry Potter e a Pedra Filosofal",author:"J. K. Rowling",category:"Fantasia",color:"#5b536f",available:true},
{id:5,title:"Orgulho e Preconceito",author:"Jane Austen",category:"Romance",color:"#8b5360",available:true},
{id:6,title:"O Hobbit",author:"J. R. R. Tolkien",category:"Fantasia",color:"#496b4d",available:true}
];

let users=JSON.parse(localStorage.getItem("ln_users")||"[]");
let current=JSON.parse(localStorage.getItem("ln_current")||"null");
let loans=JSON.parse(localStorage.getItem("ln_loans")||"[]");

function save(){localStorage.setItem("ln_users",JSON.stringify(users));localStorage.setItem("ln_current",JSON.stringify(current));localStorage.setItem("ln_loans",JSON.stringify(loans));}
function showPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
 const el=document.getElementById(id); if(el) el.classList.add("active");
 window.scrollTo({top:0,behavior:"smooth"});
 if(id==="catalog")renderCatalog();
 if(id==="loans")renderLoans();
}
function authArea(){
 const a=document.getElementById("authArea");
 if(current) a.innerHTML=`<div class="user-menu"><button class="account-btn" onclick="showPage('loans')">👤 ${escapeHtml(current.name.split(" ")[0])}</button><span class="logout" onclick="logout()">Sair</span></div>`;
 else a.innerHTML=`<button class="account-btn" onclick="showPage('login')">Entrar</button>`;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function card(b){
 const loan=loans.find(l=>l.bookId===b.id && l.email===current?.email && l.status==="ativo");
 const unavailable=loan || !b.available;
 return `<article class="book-card"><div class="cover" style="background:${b.color}"><span class="genre">${b.category}</span><h3>${b.title}</h3></div><div class="book-info"><p class="author">${b.author}</p><span class="status ${unavailable?'unavailable':'available'}">${unavailable?'● Indisponível':'● Disponível'}</span><div class="book-footer">${loan?`<button class="btn small-btn secondary" onclick="showPage('loans')">Ver empréstimo</button>`:`<button class="btn small-btn primary" ${unavailable?'disabled':''} onclick="borrow(${b.id})">${unavailable?'Indisponível':'Emprestar livro'}</button>`}</div></div></article>`;
}
function renderCatalog(){
 const q=(document.getElementById("searchInput")?.value||"").toLowerCase();
 const cat=document.getElementById("categoryFilter")?.value||"all";
 const list=books.filter(b=>(b.title.toLowerCase().includes(q)||b.author.toLowerCase().includes(q))&&(cat==="all"||b.category===cat));
 document.getElementById("catalogBooks").innerHTML=list.length?list.map(card).join(""):`<div class="empty">Nenhum livro encontrado.</div>`;
}
function renderFeatured(){document.getElementById("featuredBooks").innerHTML=books.slice(0,3).map(card).join("")}
function borrow(id){
 if(!current){showPage("login");toast("Entre na sua conta para fazer um empréstimo.");return}
 if(loans.some(l=>l.email===current.email&&l.bookId===id&&l.status==="ativo"))return;
 const b=books.find(x=>x.id===id); if(!b)return;
 const date=new Date(), due=new Date(date); due.setDate(due.getDate()+14);
 loans.push({id:Date.now(),bookId:id,email:current.email,borrowed:date.toISOString(),due:due.toISOString(),status:"ativo"});
 save();renderCatalog();renderFeatured();toast("Livro emprestado com sucesso!");showPage("loans");
}
function renderLoans(){
 const box=document.getElementById("loansContent");
 if(!current){box.innerHTML=`<div class="empty">🔐<h3>Entre na sua conta</h3><p>Faça login para visualizar e gerenciar seus empréstimos.</p><button class="btn primary" onclick="showPage('login')">Entrar</button></div>`;return}
 const mine=loans.filter(l=>l.email===current.email&&l.status==="ativo");
 if(!mine.length){box.innerHTML=`<div class="empty">📚<h3>Nenhum empréstimo ativo</h3><p>Escolha um livro no catálogo para começar.</p><button class="btn primary" onclick="showPage('catalog')">Explorar catálogo</button></div>`;return}
 box.innerHTML=mine.map(l=>{const b=books.find(x=>x.id===l.bookId);return `<div class="loan-card"><div><h3>${b.title}</h3><p>${b.author}</p><p>Empréstimo: ${fmt(l.borrowed)} • Devolução: <strong>${fmt(l.due)}</strong></p></div><button class="btn danger" onclick="returnBook(${l.id})">Devolver livro</button></div>`}).join("");
}
function fmt(d){return new Date(d).toLocaleDateString("pt-BR")}
function returnBook(id){const l=loans.find(x=>x.id===id);if(!l)return;l.status="devolvido";save();renderLoans();renderCatalog();renderFeatured();toast("Livro devolvido com sucesso!")}
function register(e){e.preventDefault();const name=document.getElementById("regName").value.trim(),email=document.getElementById("regEmail").value.trim().toLowerCase(),password=document.getElementById("regPassword").value;if(users.some(u=>u.email===email)){document.getElementById("registerMsg").textContent="Este e-mail já está cadastrado.";return}users.push({name,email,password});current={name,email};save();authArea();toast("Conta criada!");showPage("loans")}
function login(e){e.preventDefault();const email=document.getElementById("loginEmail").value.trim().toLowerCase(),password=document.getElementById("loginPassword").value,u=users.find(x=>x.email===email&&x.password===password);if(!u){document.getElementById("loginMsg").textContent="E-mail ou senha incorretos.";return}current={name:u.name,email:u.email};save();authArea();toast("Login realizado com sucesso!");showPage("loans")}
function logout(){current=null;save();authArea();showPage("home");toast("Você saiu da sua conta.")}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.style.display="block";clearTimeout(window.tt);window.tt=setTimeout(()=>t.style.display="none",2600)}
document.addEventListener("DOMContentLoaded",()=>{authArea();renderFeatured();renderCatalog()});
