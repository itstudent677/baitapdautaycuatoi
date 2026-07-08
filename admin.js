
// ═══ STORAGE ═══
const SK = 'softplush_data';
function defaultData(){
  return{
    products:[
      {id:1,name:'Bánh Sừng Bò',price:24.99,stock:10,img:'croissant.jpg',desc:'Bánh sừng bò đáng yêu.',tag:'hot'},
      {id:2,name:'Gấu Teddy Ngủ Nhiều',price:32.50,stock:8,img:'bear.jpg',desc:'Người bạn cho buổi chiều lười.',tag:''},
      {id:3,name:'Thỏ Dâu Tây',price:28.00,stock:12,img:'strawberry-bunny.jpg',desc:'Ngọt ngào như mùa hè.',tag:'new'},
      {id:4,name:'Cá Voi Mây',price:35.00,stock:6,img:'cloud-whale.jpg',desc:'Bay trên giấc mơ.',tag:''},
      {id:5,name:'Rồng Nhỏ Xinh',price:18.50,stock:15,img:'tiny-dragon.jpg',desc:'Phép thuật nhỏ bé.',tag:'hot'},
      {id:6,name:'Chó Con Pancake',price:26.00,stock:9,img:'pancake-pup.jpg',desc:'Buổi sáng ngọt ngào.',tag:''},
      {id:7,name:'Cú Đêm',price:30.00,stock:5,img:'owl.jpg',desc:'Gác đêm đáng yêu.',tag:'new'},
      {id:8,name:'Ếch Túi Nhỏ',price:15.00,stock:20,img:'pocket-frog.jpg',desc:'Nhỏ gọn, bỏ túi.',tag:''},
    ],
    customers:[],transactions:[],nextPid:9,nextCid:1
  };
}
let D = {};
function load(){ try{ const r=localStorage.getItem(SK); if(r) D=JSON.parse(r); else D=defaultData(); }catch(e){ D=defaultData(); } }
function save(){ localStorage.setItem(SK,JSON.stringify(D)); }
function reloadData(){ load(); renderAll(); }
load();

// ═══ CHARTS ═══
let chartDaily=null, chartTop=null, chartRevLine=null, chartRevPie=null;
const pkColors=['#ff8fd0','#c9a0dc','#90c7f5','#7ecba1','#ffd97d','#ff7fa2','#ffb347','#b8a9e0'];

function last7Days(){
  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    days.push(d.toISOString().slice(0,10));
  }
  return days;
}
function getRevByDay(){
  const days=last7Days();
  const sale=days.map(d=>D.transactions.filter(t=>t.type==='thu'&&(t.time||'').slice(0,10)===d).reduce((s,t)=>s+t.total,0));
  const buy=days.map(d=>D.transactions.filter(t=>t.type==='nhap'&&(t.time||'').slice(0,10)===d).reduce((s,t)=>s+t.total,0));
  return{days:days.map(d=>d.slice(5)),sale,buy};
}
function getTopProducts(){
  const map={};
  D.transactions.filter(t=>t.type==='thu').forEach(t=>{
    map[t.pname]=(map[t.pname]||0)+t.qty;
  });
  const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return{labels:entries.map(e=>e[0]),vals:entries.map(e=>e[1])};
}

function buildCharts(){
  const rb=getRevByDay();
  const top=getTopProducts();
  // daily bar
  const ctx1=document.getElementById('chart-daily');
  if(ctx1){
    if(chartDaily) chartDaily.destroy();
    chartDaily=new Chart(ctx1,{type:'bar',data:{labels:rb.days,datasets:[
      {label:'Bán hàng',data:rb.sale,backgroundColor:'rgba(255,143,208,.7)',borderRadius:6},
      {label:'Nhập kho',data:rb.buy,backgroundColor:'rgba(144,199,245,.6)',borderRadius:6}
    ]},options:{plugins:{legend:{labels:{font:{family:'Quicksand'},color:'#9070a0'}}},scales:{x:{ticks:{color:'#b07ab0',font:{family:'Quicksand'}}},y:{ticks:{color:'#b07ab0',font:{family:'Quicksand'}}}}}});
  }
  // top pie
  const ctx2=document.getElementById('chart-top');
  if(ctx2){
    if(chartTop) chartTop.destroy();
    if(top.labels.length){
      chartTop=new Chart(ctx2,{type:'doughnut',data:{labels:top.labels,datasets:[{data:top.vals,backgroundColor:pkColors,borderWidth:2,borderColor:'#fff'}]},options:{plugins:{legend:{position:'bottom',labels:{font:{family:'Quicksand',size:11},color:'#9070a0'}}}}});
    }
  }
}
function buildRevCharts(){
  const rb=getRevByDay();
  const totalSale=D.transactions.filter(t=>t.type==='thu').reduce((s,t)=>s+t.total,0);
  const totalBuy=D.transactions.filter(t=>t.type==='nhap').reduce((s,t)=>s+t.total,0);
  const ctx3=document.getElementById('chart-rev-line');
  if(ctx3){
    if(chartRevLine) chartRevLine.destroy();
    chartRevLine=new Chart(ctx3,{type:'line',data:{labels:rb.days,datasets:[
      {label:'Bán hàng',data:rb.sale,borderColor:'#ff8fd0',backgroundColor:'rgba(255,143,208,.12)',tension:.4,fill:true,pointBackgroundColor:'#ff8fd0'},
      {label:'Nhập kho',data:rb.buy,borderColor:'#90c7f5',backgroundColor:'rgba(144,199,245,.1)',tension:.4,fill:true,pointBackgroundColor:'#90c7f5'}
    ]},options:{plugins:{legend:{labels:{font:{family:'Quicksand'},color:'#9070a0'}}},scales:{x:{ticks:{color:'#b07ab0',font:{family:'Quicksand'}}},y:{ticks:{color:'#b07ab0',font:{family:'Quicksand'}}}}}});
  }
  const ctx4=document.getElementById('chart-rev-pie');
  if(ctx4){
    if(chartRevPie) chartRevPie.destroy();
    chartRevPie=new Chart(ctx4,{type:'pie',data:{labels:['Thu bán hàng','Chi nhập kho'],datasets:[{data:[totalSale,totalBuy],backgroundColor:['rgba(255,143,208,.8)','rgba(144,199,245,.8)'],borderWidth:3,borderColor:'#fff'}]},options:{plugins:{legend:{position:'bottom',labels:{font:{family:'Quicksand'},color:'#9070a0'}}}}});
  }
}

// ═══ AUTH ═══
function doLogin(){
  const u=document.getElementById('lu').value.trim(),p=document.getElementById('lp').value;
  const err=document.getElementById('lerr');
  if(u==='admin'&&p==='1234'){
    err.style.display='none';
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').style.display='block';
    renderAll(); setTimeout(buildCharts,100);
  } else { err.style.display='block'; document.getElementById('lp').value=''; }
}
document.getElementById('lp').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});
document.getElementById('lu').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});
function doLogout(){
  document.getElementById('app').style.display='none';
  document.getElementById('login-screen').style.display='flex';
  document.getElementById('lu').value=''; document.getElementById('lp').value='';
}
function toggleEye(){
  const i=document.getElementById('lp'),ic=document.getElementById('eye-ic');
  if(i.type==='password'){i.type='text';ic.className='fa-solid fa-eye-slash';}
  else{i.type='password';ic.className='fa-solid fa-eye';}
}

// ═══ NAV ═══
function goto(name,el){
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('sec-'+name).classList.add('active');
  el.classList.add('active');
  load();
  if(name==='dashboard'){renderStats();renderDashTxn();setTimeout(buildCharts,80);}
  if(name==='products') renderProducts();
  if(name==='inventory') renderInventory();
  if(name==='customers') renderCustomers();
  if(name==='revenue'){renderRevenue();setTimeout(buildRevCharts,80);}
}

// ═══ MODAL ═══
function openM(id){
  if(id==='m-nhap'||id==='m-thu') fillPSelect();
  if(id==='m-thu') fillCSelect();
  document.getElementById(id).classList.add('open');
}
function closeM(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.mo').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));

// ═══ TOAST ═══
function showToast(msg){
  const t=document.getElementById('toast');
  document.getElementById('tmsg').textContent=msg;
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600);
}

// ═══ HELPERS ═══
function fmt(d){ const dt=d instanceof Date?d:new Date(d); return dt.toLocaleDateString('vi-VN')+' '+dt.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}); }
function fmtShort(d){ const dt=d instanceof Date?d:new Date(d); return dt.toLocaleDateString('vi-VN'); }

// ═══ STATS ═══
function renderStats(){
  load();
  document.getElementById('s-prod').textContent=D.products.length;
  document.getElementById('s-cust').textContent=D.customers.length;
  const rev=D.transactions.filter(t=>t.type==='thu').reduce((s,t)=>s+t.total,0);
  document.getElementById('s-rev').textContent='$'+rev.toFixed(2);
  const stock=D.products.reduce((s,p)=>s+p.stock,0);
  document.getElementById('s-stock').textContent=stock;
}
function renderDashTxn(){
  const recent=[...D.transactions].reverse().slice(0,8);
  const tb=document.getElementById('dash-txn');
  if(!recent.length){tb.innerHTML='<tr><td colspan="6"><div class="empty"><div class="emo"></div><p>Chưa có giao dịch</p></div></td></tr>';return;}
  tb.innerHTML=recent.map(t=>`<tr>
    <td style="font-size:.76rem;color:#b07ab0">${fmt(t.time)}</td>
    <td>${t.type==='nhap'?'<span class="badge b-gr"> Nhập</span>':'<span class="badge b-yl"> Bán</span>'}</td>
    <td>${t.pname}</td>
    <td style="font-size:.85rem">${t.cname||'—'}</td>
    <td>${t.qty}</td>
    <td>${t.type==='nhap'?'<span class="txn-out">-$'+t.total.toFixed(2)+'</span>':'<span class="txn-in">+$'+t.total.toFixed(2)+'</span>'}</td>
  </tr>`).join('');
}

// ═══ PRODUCTS ═══
function renderProducts(){
  load();
  const q=document.getElementById('p-search').value.toLowerCase();
  const tb=document.getElementById('p-body');
  const list=D.products.filter(p=>p.name.toLowerCase().includes(q));
  if(!list.length){tb.innerHTML='<tr><td colspan="7"><div class="empty"><div class="emo"></div><p>Không tìm thấy</p></div></td></tr>';return;}
  tb.innerHTML=list.map(p=>`<tr>
    <td><img src="${p.img}" class="thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2242%22 height=%2242%22><rect width=%2242%22 height=%2242%22 rx=%228%22 fill=%22%23ffe4f3%22/><text x=%2221%22 y=%2228%22 text-anchor=%22middle%22 font-size=%2218%22>🧸</text></svg>'"></td>
    <td><strong>${p.name}</strong><br><small style="color:#c09ab0">${p.desc||''}</small></td>
    <td>$${p.price.toFixed(2)}</td>
    <td>${p.stock}</td>
    <td>${p.tag==='hot'?'<span class="badge b-rd"> Hot</span>':p.tag==='new'?'<span class="badge b-pk"> New</span>':'<span style="color:#ccc;font-size:.8rem">—</span>'}</td>
    <td>${p.stock>0?'<span class="badge b-gr">Còn hàng</span>':'<span class="badge b-rd">Hết hàng</span>'}</td>
    <td style="display:flex;gap:6px">
      <button class="bi bi-ed" onclick="openEditP(${p.id})"><i class="fa-solid fa-pen"></i></button>
      <button class="bi bi-dl" onclick="delProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
    </td>
  </tr>`).join('');
}
function addProduct(){
  const name=document.getElementById('ap-name').value.trim();
  const price=parseFloat(document.getElementById('ap-price').value);
  const stock=parseInt(document.getElementById('ap-stock').value)||0;
  const img=document.getElementById('ap-img').value.trim()||'bear.jpg';
  const desc=document.getElementById('ap-desc').value.trim();
  const tag=document.getElementById('ap-tag').value;
  if(!name||isNaN(price)){showToast(' Vui lòng điền đủ thông tin!');return;}
  load(); D.products.push({id:D.nextPid++,name,price,stock,img,desc,tag}); save();
  closeM('m-addp');
  ['ap-name','ap-price','ap-stock','ap-img','ap-desc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ap-tag').value='';
  renderProducts(); renderStats();
  showToast(' Đã thêm: '+name);
}
function openEditP(id){
  load(); const p=D.products.find(x=>x.id===id); if(!p) return;
  document.getElementById('ep-id').value=id;
  document.getElementById('ep-name').value=p.name;
  document.getElementById('ep-price').value=p.price;
  document.getElementById('ep-stock').value=p.stock;
  document.getElementById('ep-img').value=p.img;
  document.getElementById('ep-desc').value=p.desc||'';
  document.getElementById('ep-tag').value=p.tag||'';
  openM('m-editp');
}
function saveEditP(){
  load();
  const id=parseInt(document.getElementById('ep-id').value);
  const p=D.products.find(x=>x.id===id); if(!p) return;
  p.name=document.getElementById('ep-name').value.trim();
  p.price=parseFloat(document.getElementById('ep-price').value);
  p.stock=parseInt(document.getElementById('ep-stock').value)||0;
  p.img=document.getElementById('ep-img').value.trim();
  p.desc=document.getElementById('ep-desc').value.trim();
  p.tag=document.getElementById('ep-tag').value;
  save(); closeM('m-editp'); renderProducts(); renderStats();
  showToast(' Đã cập nhật: '+p.name);
}
function delProduct(id){
  load(); const p=D.products.find(x=>x.id===id); if(!p) return;
  if(!confirm('Xóa sản phẩm "'+p.name+'"?')) return;
  D.products=D.products.filter(x=>x.id!==id); save();
  renderProducts(); renderStats(); showToast(' Đã xóa: '+p.name);
}

// ═══ SELECTS ═══
function fillPSelect(){
  load();
  ['nhap-p','thu-p'].forEach(id=>{
    const s=document.getElementById(id); if(!s) return;
    s.innerHTML=D.products.map(p=>`<option value="${p.id}">${p.name} (Tồn: ${p.stock})</option>`).join('');
  });
}
function fillCSelect(){
  load(); const s=document.getElementById('thu-c'); if(!s) return;
  s.innerHTML='<option value="">Khách vãng lai</option>'+D.customers.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}
function fillThuPrice(){
  load(); const pid=parseInt(document.getElementById('thu-p').value);
  const p=D.products.find(x=>x.id===pid);
  if(p) document.getElementById('thu-pr').value=p.price.toFixed(2);
}

// ═══ INVENTORY ═══
function doNhap(){
  load();
  const pid=parseInt(document.getElementById('nhap-p').value);
  const qty=parseInt(document.getElementById('nhap-q').value)||0;
  const price=parseFloat(document.getElementById('nhap-pr').value)||0;
  const note=document.getElementById('nhap-n').value.trim();
  if(qty<=0){showToast(' Số lượng phải > 0!');return;}
  const p=D.products.find(x=>x.id===pid); if(!p) return;
  p.stock+=qty;
  D.transactions.push({id:Date.now(),type:'nhap',pid,pname:p.name,qty,price,total:qty*price,note,time:new Date().toISOString(),cid:null,cname:null});
  save(); closeM('m-nhap');
  ['nhap-q','nhap-pr','nhap-n'].forEach(id=>document.getElementById(id).value='');
  renderInventory(); renderStats(); renderProducts();
  showToast(' Nhập '+qty+' sản phẩm: '+p.name);
}
function doThu(){
  load();
  const pid=parseInt(document.getElementById('thu-p').value);
  const qty=parseInt(document.getElementById('thu-q').value)||0;
  const price=parseFloat(document.getElementById('thu-pr').value)||0;
  const note=document.getElementById('thu-n').value.trim();
  const cidVal=document.getElementById('thu-c').value;
  const cid=cidVal?parseInt(cidVal):null;
  if(qty<=0){showToast(' Số lượng phải > 0!');return;}
  const p=D.products.find(x=>x.id===pid); if(!p) return;
  if(p.stock<qty){showToast(' Tồn kho không đủ! Còn: '+p.stock);return;}
  p.stock-=qty;
  const cname=cid?(D.customers.find(x=>x.id===cid)||{name:'Khách vãng lai'}).name:'Khách vãng lai';
  D.transactions.push({id:Date.now(),type:'thu',pid,pname:p.name,qty,price,total:qty*price,note,time:new Date().toISOString(),cid,cname});
  save(); closeM('m-thu');
  ['thu-q','thu-pr','thu-n'].forEach(id=>document.getElementById(id).value='');
  renderInventory(); renderStats(); renderProducts(); renderCustomers();
  showToast(' Bán '+qty+' sản phẩm: '+p.name);
}
function renderInventory(){
  load(); const tb=document.getElementById('inv-body');
  if(!D.transactions.length){tb.innerHTML='<tr><td colspan="8"><div class="empty"><div class="emo"></div><p>Chưa có giao dịch</p></div></td></tr>';return;}
  tb.innerHTML=[...D.transactions].reverse().map(t=>`<tr>
    <td style="font-size:.76rem;color:#b07ab0">${fmt(t.time)}</td>
    <td>${t.type==='nhap'?'<span class="badge b-gr"> Nhập kho</span>':'<span class="badge b-yl"> Bán hàng</span>'}</td>
    <td>${t.pname}</td>
    <td style="font-size:.85rem">${t.cname||'—'}</td>
    <td>${t.qty}</td>
    <td>$${t.price.toFixed(2)}</td>
    <td>${t.type==='nhap'?'<span class="txn-out">-$'+t.total.toFixed(2)+'</span>':'<span class="txn-in">+$'+t.total.toFixed(2)+'</span>'}</td>
    <td style="font-size:.82rem;color:#b07ab0">${t.note||'—'}</td>
  </tr>`).join('');
}

// ═══ CUSTOMERS ═══
function renderCustomers(){
  load();
  const q=document.getElementById('c-search').value.toLowerCase();
  const tb=document.getElementById('c-body');
  const list=D.customers.filter(c=>c.name.toLowerCase().includes(q)||(c.email||'').toLowerCase().includes(q)||(c.phone||'').includes(q));
  if(!list.length){tb.innerHTML='<tr><td colspan="7"><div class="empty"><div class="emo"></div><p>Chưa có khách hàng</p></div></td></tr>';return;}
  tb.innerHTML=list.map(c=>{
    const txns=D.transactions.filter(t=>t.cid===c.id&&t.type==='thu');
    const total=txns.reduce((s,t)=>s+t.total,0);
    return`<tr>
      <td><strong>${c.name}</strong></td>
      <td style="font-size:.85rem">${c.email||'—'}</td>
      <td>${c.phone||'—'}</td>
      <td style="font-size:.83rem;color:#b07ab0">${c.addr||'—'}</td>
      <td><span class="badge b-pk">${txns.length} đơn</span></td>
      <td style="font-weight:700;color:var(--pk)">$${total.toFixed(2)}</td>
      <td><button class="bi bi-dl" onclick="delCustomer(${c.id})"><i class="fa-solid fa-trash"></i></button></td>
    </tr>`;
  }).join('');
}
function addCustomer(){
  const name=document.getElementById('nc-name').value.trim();
  const email=document.getElementById('nc-email').value.trim();
  const phone=document.getElementById('nc-phone').value.trim();
  const addr=document.getElementById('nc-addr').value.trim();
  if(!name){showToast('Vui lòng nhập tên!');return;}
  load(); D.customers.push({id:D.nextCid++,name,email,phone,addr}); save();
  closeM('m-addc');
  ['nc-name','nc-email','nc-phone','nc-addr'].forEach(id=>document.getElementById(id).value='');
  renderCustomers(); renderStats(); showToast(' Đã thêm: '+name);
}
function delCustomer(id){
  load(); const c=D.customers.find(x=>x.id===id); if(!c) return;
  if(!confirm('Xóa khách hàng "'+c.name+'"?')) return;
  D.customers=D.customers.filter(x=>x.id!==id); save();
  renderCustomers(); renderStats(); showToast(' Đã xóa: '+c.name);
}

// ═══ REVENUE ═══
function renderRevenue(){
  load();
  const sale=D.transactions.filter(t=>t.type==='thu').reduce((s,t)=>s+t.total,0);
  const buy=D.transactions.filter(t=>t.type==='nhap').reduce((s,t)=>s+t.total,0);
  const net=sale-buy;
  document.getElementById('r-net').textContent=(net>=0?'+':'')+' $'+net.toFixed(2);
  document.getElementById('r-sale').textContent='$'+sale.toFixed(2);
  document.getElementById('r-buy').textContent='$'+buy.toFixed(2);
  document.getElementById('r-txns').textContent=D.transactions.length;
  const tb=document.getElementById('rev-body');
  if(!D.transactions.length){tb.innerHTML='<tr><td colspan="7"><div class="empty"><div class="emo"></div><p>Chưa có giao dịch</p></div></td></tr>';return;}
  tb.innerHTML=[...D.transactions].reverse().map(t=>`<tr>
    <td style="font-size:.76rem;color:#b07ab0">${fmt(t.time)}</td>
    <td>${t.type==='nhap'?'<span class="badge b-gr">Nhập kho</span>':'<span class="badge b-yl">Bán hàng</span>'}</td>
    <td>${t.pname}</td>
    <td style="font-size:.85rem">${t.cname||'—'}</td>
    <td>${t.qty}</td>
    <td>$${t.price.toFixed(2)}</td>
    <td>${t.type==='nhap'?'<span class="txn-out">-$'+t.total.toFixed(2)+'</span>':'<span class="txn-in">+$'+t.total.toFixed(2)+'</span>'}</td>
  </tr>`).join('');
}

// ═══ RENDER ALL ═══
function renderAll(){
  renderStats(); renderDashTxn(); renderProducts(); renderInventory(); renderCustomers(); renderRevenue();
}
