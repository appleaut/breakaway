(function(){
"use strict";
var PAGE_SIZE = 5, PAGE_HOME = 3;
var entries = [], shown = 0;

function el(html){var d=document.createElement("div");d.innerHTML=html.trim();return d.firstChild}
function L(o){if(!o)return"";if(typeof o==="string")return o;return o.th||""}

function tldrHtml(t){
  if(!t)return"";
  var lines=t.split(/\n+/).map(function(l){return l.replace(/^[•\-]\s*/,"").trim()}).filter(Boolean);
  if(lines.length<=1)return"<p>"+lines[0]+"</p>";
  return"<ul class='tldr-list'>"+lines.map(function(l){return"<li>"+l+"</li>"}).join("")+"</ul>";
}

function mdToHtml(md){
  if(!md)return"";
  return md.split(/\n\n+/).map(function(b){
    b=b.trim();if(!b)return"";
    if(b.match(/^### /m)){
      var ha=[],pa=[];
      b.split(/\n/).forEach(function(l){
        l=l.trim();if(!l)return;
        if(/^### /.test(l))ha.push("<h3>"+l.replace(/^###\s*/,"")+"</h3>");
        else pa.push(l);
      });
      return ha.join("\n")+(pa.length?"<p>"+pa.join("<br>")+"</p>":"");
    }
    if(b.match(/^- /m)){
      var items=b.split(/\n/).filter(function(l){return l.trim()}).map(function(l){return"<li>"+l.replace(/^-\s*/,"")+"</li>"});
      return"<ul class='md-list'>"+items.join("")+"</ul>";
    }
    return"<p>"+b.replace(/\n/g,"<br>")+"</p>";
  }).join("\n");
}

function cardHtml(e){
  return'<a class="entry-card" href="/entry/'+e.id+'">'+
    '<div class="entry-date">'+(e.date||"")+'</div>'+
    '<div class="entry-title">'+L(e.title)+'</div>'+
    '<div class="entry-highlight">'+(L(e.highlight)||"")+'</div>'+
  '</a>';
}

function renderEntries(container, limit){
  if(limit===undefined||limit<shown){container.innerHTML="";shown=0;}
  var n=Math.min(limit||entries.length, entries.length);
  for(var i=shown;i<n;i++){container.appendChild(el(cardHtml(entries[i])));shown++}
}

// Check if we're on an /entry/<id> page
var entryMatch = window.location.pathname.match(/^\/entry\/([^/]+)\/?$/);
if(entryMatch){
  // Article page — load entries, find match, render
  fetch("/entries.json").then(function(r){return r.json()}).then(function(d){
    entries=(d.entries||[]);
    var id=entryMatch[1], match=null;
    for(var i=0;i<entries.length;i++){if(entries[i].id===id){match=entries[i];break}}
    if(!match){window.location.replace("/");return}
    document.getElementById("article-date").textContent=match.date||"";
    document.getElementById("article-title").textContent=L(match.title);
    var tldr=L(match.tldr)||"";
    var tldrBox=document.getElementById("article-tldr");
    if(tldrBox){if(tldr){tldrBox.style.display="block";tldrBox.innerHTML=tldrHtml(tldr)}else tldrBox.style.display="none"}
    document.getElementById("article-body").innerHTML=mdToHtml(L(match.body));
    document.getElementById("article").style.display="block";
    document.getElementById("list-section").style.display="none";
    document.title = L(match.title) + " — Breakaway";
  });
  // back button — always return to home
  var btnBack=document.getElementById("btn-back");
  if(btnBack) btnBack.addEventListener("click",function(ev){ev.preventDefault();window.location.href="/"});
} else {
  // List page (home or articles)
  fetch("/entries.json").then(function(r){return r.json()}).then(function(d){
    entries=(d.entries||[]).sort(function(a,b){return a.date<b.date?1:-1});
    var container=document.getElementById("entry-list");
    if(!container)return;
    var btn=document.getElementById("load-more");
    if(btn){
      // articles page: paginate with 5 per page
      renderEntries(container, PAGE_SIZE);
      if(entries.length>PAGE_SIZE)btn.style.display="inline-block";
      btn.onclick=function(){renderEntries(container, shown+PAGE_SIZE);if(shown>=entries.length)btn.style.display="none";};
    }else{
      // home page: lazy-load — show the first batch, then more as user scrolls
      renderEntries(container, PAGE_SIZE);
      var sentinel=document.getElementById("load-sentinel");
      if(sentinel&&entries.length>PAGE_SIZE){
        if("IntersectionObserver" in window){
          var io=new IntersectionObserver(function(es){
            es.forEach(function(en){
              if(en.isIntersecting){
                renderEntries(container, shown+PAGE_SIZE);
                if(shown>=entries.length)io.disconnect();
              }
            });
          },{rootMargin:"200px"});
          io.observe(sentinel);
        }else{
          sentinel.addEventListener("scroll",function(){});
        }
      }
    }
  });
}
})();
