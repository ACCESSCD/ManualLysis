import React, { useEffect, useState } from 'react';
import './ManualLysisView.css';

const ManualLysisView = () => {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    let currentZoom = 100;
    let pageTexts = [];
    let pageItems = [];
    let searchMatches = [];
    let currentMatchIndex = -1;
    let pdfDocGlobal = null;
    let indexDestMap = [];

    function clearHighlights() {
      if (!pdfDocGlobal) return;
      for (let i = 1; i <= pdfDocGlobal.numPages; i++) {
        const layer = document.getElementById(`highlight-${i}`);
        if (layer) layer.innerHTML = '';
      }
    }

    function performPageJump(pg) {
      if (!pdfDocGlobal) return;
      clearHighlights();
      const pSearch = pg.trim().toLowerCase();
      const pEscaped = pSearch.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const pgRegex = new RegExp(`\\b${pEscaped}\\b`, 'i');
      let candidates = [];

      for (let i = 0; i < pageItems.length; i++) {
        const pt = pageItems[i];
        const highlightLayer = document.getElementById(`highlight-${pt.pageNum}`);
        if (!highlightLayer) continue;

        for (let j = 0; j < pt.items.length; j++) {
           const item = pt.items[j];
           const iStr = item.str;

           if (pgRegex.test(iStr)) {
              const rect = [item.transform[4], item.transform[5], item.transform[4] + item.width, item.transform[5] + 10];
              const viewRect = pt.viewport.convertToViewportRectangle(rect);
              const xMin = Math.min(viewRect[0], viewRect[2]);
              const normX = xMin / pt.viewport.width;

              candidates.push({ pt, item, normX, highlightLayer });
           }
        }
      }

      if (pSearch !== '1') {
         candidates = candidates.filter(c => c.pt.pageNum !== 1);
      }

      candidates.sort((a, b) => {
         const distA = Math.abs(a.normX - 0.5);
         const distB = Math.abs(b.normX - 0.5);
         return distB - distA;
      });

      if (candidates.length > 0) {
         const best = candidates[0];
         const fontHeight = Math.abs(best.item.transform[3]) || best.item.height || 10;
         const tx = best.item.transform[4];
         const ty = best.item.transform[5];
         const width = best.item.width || 10;

         const rect = [tx, ty, tx + width, ty + fontHeight];
         const viewRect = best.pt.viewport.convertToViewportRectangle(rect);
         const yMin = Math.min(viewRect[1], viewRect[3]);
         const xMin = Math.min(viewRect[0], viewRect[2]);
         const drawWidth = Math.abs(viewRect[2] - viewRect[0]);

         const mark = document.createElement('div');
         mark.className = 'highlight-box';
         mark.style.left = (xMin / best.pt.viewport.width * 100) + '%';
         mark.style.top = (yMin / best.pt.viewport.height * 100) + '%';
         mark.style.width = (drawWidth / best.pt.viewport.width * 100) + '%';
         mark.style.height = (fontHeight / best.pt.viewport.height * 100) + '%';
         best.highlightLayer.appendChild(mark);

         setTimeout(() => {
            const headerOffset = 300;
            const elementPosition = mark.getBoundingClientRect().top;
            window.scrollTo({
               top: elementPosition + window.scrollY - headerOffset,
               behavior: "smooth"
            });
         }, 50);

         document.getElementById('searchInfo').innerText = `Pg ${pg}`;
         searchMatches = [];
         updateNavButtons();
      } else {
         alert(`Could not locate page "${pg}". Try searching for the section title directly!`);
      }
    }

    function executeSearch() {
      const query = document.getElementById('searchInput').value.trim();
      const infoText = document.getElementById('searchInfo');

      clearHighlights();

      if (/^\d+$/.test(query) && pdfDocGlobal) {
        performPageJump(query);
        return;
      }

      if (!query || !pdfDocGlobal) {
        searchMatches = [];
        infoText.innerText = '';
        updateNavButtons();
        return;
      }

      const qLower = query.toLowerCase();
      searchMatches = [];
      let matchCount = 0;

      const queryWords = qLower.split(/\s+/).filter(w => w.length > 2);

      pageItems.forEach(pt => {
        const pageTextObj = pageTexts.find(p => p.pageNum === pt.pageNum);
        if (pageTextObj && !pageTextObj.text.includes(qLower)) return;

        const highlightLayer = document.getElementById(`highlight-${pt.pageNum}`);
        if (!highlightLayer) return;

        pt.items.forEach(item => {
          const iLower = item.str.toLowerCase();
          const matchesFull = iLower.includes(qLower);
          const matchesWord = queryWords.some(w => iLower.includes(w));

          if (matchesFull || (qLower.includes(" ") && matchesWord)) {
             const fontHeight = Math.abs(item.transform[3]) || item.height || 10;
             const tx = item.transform[4];
             const ty = item.transform[5];
             const width = item.width || 10;

             const rect = [tx, ty, tx + width, ty + fontHeight];
             const viewRect = pt.viewport.convertToViewportRectangle(rect);
             const xMin = Math.min(viewRect[0], viewRect[2]);
             const yMin = Math.min(viewRect[1], viewRect[3]);
             const drawWidth = Math.abs(viewRect[2] - viewRect[0]);

             const markId = `match-${matchCount++}`;
             const mark = document.createElement('div');
             mark.className = 'highlight-box';
             mark.id = markId;
             mark.style.left = (xMin / pt.viewport.width * 100) + '%';
             mark.style.top = (yMin / pt.viewport.height * 100) + '%';
             mark.style.width = (drawWidth / pt.viewport.width * 100) + '%';
             mark.style.height = (fontHeight / pt.viewport.height * 100) + '%';
             mark.style.marginTop = (-0.2 * fontHeight / pt.viewport.height * 100) + '%';

             highlightLayer.appendChild(mark);
             searchMatches.push({ pageNum: pt.pageNum, markId: markId });
          }
        });
      });

      if (searchMatches.length > 0) {
        currentMatchIndex = 0;
        scrollToMatch(currentMatchIndex);
        updateNavButtons();
      } else {
        infoText.innerText = '0/0';
        updateNavButtons();
        alert('No matches found for "' + query + '"');
      }
    }

    function scrollToMatch(index) {
      if (index < 0 || index >= searchMatches.length) return;
      const match = searchMatches[index];
      const markEl = document.getElementById(match.markId);

      if (markEl) {
        const headerOffset = 300;
        const elementPosition = markEl.getBoundingClientRect().top;
        window.scrollTo({
           top: elementPosition + window.scrollY - headerOffset,
           behavior: "smooth"
        });
      } else {
        scrollToPage(match.pageNum);
      }
    }

    function scrollToPage(pageNum) {
      const wrapper = document.getElementById(`wrapper-${pageNum}`);
      if (wrapper) {
        const headerOffset = 80;
        const elementPosition = wrapper.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({
           top: offsetPosition,
           behavior: "smooth"
        });
      }
    }

    function updateNavButtons() {
      const infoText = document.getElementById('searchInfo');
      const prevBtn = document.getElementById('prevMatchBtn');
      const nextBtn = document.getElementById('nextMatchBtn');

      if (!prevBtn || !nextBtn) return;

      if (searchMatches.length > 0) {
        infoText.innerText = `${currentMatchIndex + 1}/${searchMatches.length}`;
        prevBtn.disabled = currentMatchIndex === 0;
        nextBtn.disabled = currentMatchIndex === searchMatches.length - 1;
      } else {
        if (!/^\d+$/.test(document.getElementById('searchInput').value.trim())) {
          infoText.innerText = '';
        }
        prevBtn.disabled = true;
        nextBtn.disabled = true;
      }
    }

    // Attach to window so buttons can use it
    window.promptPageJump = function() {
      const pg = prompt(`Enter page number to jump to:`);
      if (pg) {
         performPageJump(pg);
      }
    };

    window.executeSearch = executeSearch;
    
    window.nextMatch = function() {
      if (currentMatchIndex < searchMatches.length - 1) {
        currentMatchIndex++;
        scrollToMatch(currentMatchIndex);
        updateNavButtons();
      }
    };

    window.prevMatch = function() {
      if (currentMatchIndex > 0) {
        currentMatchIndex--;
        scrollToMatch(currentMatchIndex);
        updateNavButtons();
      }
    };

    window.zoomIn = function() {
      if (currentZoom < 400) currentZoom += 25;
      updateZoom();
    };

    window.zoomOut = function() {
      if (currentZoom > 100) currentZoom -= 25;
      updateZoom();
    };

    function resetZoom() {
      if (currentZoom === 100) return;
      currentZoom = 100;
      const container = document.getElementById('pdf-container');
      if(container) {
          container.style.transition = 'none';
          container.style.width = '100%';
          container.style.maxWidth = '1200px';
          requestAnimationFrame(() => requestAnimationFrame(() => {
            container.style.transition = '';
          }));
      }
    }

    function updateZoom() {
      const container = document.getElementById('pdf-container');
      if(!container) return;
      container.style.width = currentZoom + '%';
      if (currentZoom === 100) {
        container.style.maxWidth = '1200px';
      } else {
        container.style.maxWidth = 'none';
      }
    }

    const searchInput = document.getElementById('searchInput');
    const handleKeyPress = function (e) {
      if (e.key === 'Enter') {
        executeSearch();
      }
    };
    if(searchInput) searchInput.addEventListener('keypress', handleKeyPress);

    const pdfjsLib = window.pdfjsLib;
    if (pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      // NOTE: For local Vite dev and GitHub Pages, we fetch using BASE_URL
      const url = import.meta.env.BASE_URL + 'manual.pdf';
      const container = document.getElementById('pdf-container');

      if(container) {
          pdfjsLib.getDocument(url).promise.then(function(pdf) {
            pdfDocGlobal = pdf;
            container.innerHTML = '';

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const wrapper = document.createElement('div');
              wrapper.className = 'page-wrapper';
              wrapper.id = `wrapper-${pageNum}`;

              const canvas = document.createElement('canvas');
              canvas.id = `page-${pageNum}`;
              wrapper.appendChild(canvas);

              const annotationLayer = document.createElement('div');
              annotationLayer.className = 'annotationLayer';
              annotationLayer.id = `annot-${pageNum}`;
              wrapper.appendChild(annotationLayer);

              const highlightLayer = document.createElement('div');
              highlightLayer.className = 'highlightLayer';
              highlightLayer.id = `highlight-${pageNum}`;
              wrapper.appendChild(highlightLayer);

              if (pageNum === 1) {
                 const interactiveLayer = document.createElement('div');
                 interactiveLayer.className = 'interactiveLayer';
                 interactiveLayer.id = `interactive-${pageNum}`;
                 wrapper.appendChild(interactiveLayer);
              }

              container.appendChild(wrapper);
            }

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              pdf.getPage(pageNum).then(function(page) {
                const canvas = document.getElementById(`page-${pageNum}`);
                const ctx = canvas.getContext('2d');

                const viewport = page.getViewport({scale: 2.0});
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                  canvasContext: ctx,
                  viewport: viewport
                };
                page.render(renderContext);

                const unscaledViewport = page.getViewport({scale: 1.0});

                page.getTextContent().then(function(textContent) {
                  const textStr = textContent.items.map(s => s.str).join(' ').toLowerCase();
                  pageTexts.push({ pageNum: pageNum, text: textStr });
                  pageTexts.sort((a,b) => a.pageNum - b.pageNum);

                  pageItems.push({
                     pageNum: pageNum,
                     items: textContent.items,
                     viewport: unscaledViewport
                  });
                  pageItems.sort((a,b) => a.pageNum - b.pageNum);

                  if (pageNum === 1) {
                     const interactiveLayer = document.getElementById(`interactive-${pageNum}`);
                     if (interactiveLayer) {
                        textContent.items.forEach(item => {
                            const str = item.str.trim();
                            if (str.length < 1) return;
                            if (!/^\d+$/.test(str)) return;

                            const fontHeight = Math.abs(item.transform[3]) || item.height || 10;
                            const tx = item.transform[4];
                            const ty = item.transform[5];
                            const width = item.width || 20;
                            const midX = tx + width / 2;
                            const midY = ty + fontHeight / 2;

                            const rect = [tx, ty, tx + width, ty + fontHeight];
                            const viewRect = unscaledViewport.convertToViewportRectangle(rect);
                            const yMin = Math.min(viewRect[1], viewRect[3]);
                            const xMin = Math.min(viewRect[0], viewRect[2]);
                            const drawWidth = Math.abs(viewRect[2] - viewRect[0]);

                            const btn = document.createElement('div');
                            btn.style.position = 'absolute';
                            btn.style.left = (xMin / unscaledViewport.width * 100) + '%';
                            btn.style.top = (yMin / unscaledViewport.height * 100) + '%';
                            btn.style.width = (drawWidth / unscaledViewport.width * 100) + '%';
                            btn.style.height = (fontHeight / unscaledViewport.height * 100) + '%';
                            btn.style.cursor = 'pointer';
                            btn.onclick = function() {
                                resetZoom();

                                const annotMatch = indexDestMap.find(d =>
                                    midX >= d.rect[0] && midX <= d.rect[2] &&
                                    midY >= d.rect[1] && midY <= d.rect[3]
                                );

                                if (annotMatch !== undefined) {
                                    document.getElementById('searchInfo').innerText = `Pg ${str}`;
                                    requestAnimationFrame(() => requestAnimationFrame(() => {
                                        scrollToPage(annotMatch.pdfPageIdx + 1);
                                    }));
                                } else {
                                    requestAnimationFrame(() => requestAnimationFrame(() => {
                                        const input = document.getElementById('searchInput');
                                        input.value = str;
                                        executeSearch();
                                    }));
                                }
                            };
                            interactiveLayer.appendChild(btn);
                        });
                     }
                  }
                });

                page.getAnnotations().then(function(annotations) {
                  const annotationLayer = document.getElementById(`annot-${pageNum}`);

                  annotations.forEach(function(anno) {
                    if (anno.subtype === 'Link') {
                      if (pageNum === 1 && anno.dest) {
                        const storeDestination = (dest) => {
                          if (Array.isArray(dest) && dest[0]) {
                            pdfDocGlobal.getPageIndex(dest[0]).then(function(pageIdx) {
                              indexDestMap.push({ rect: anno.rect, pdfPageIdx: pageIdx });
                            }).catch(console.error);
                          } else if (typeof dest === 'string') {
                            pdfDocGlobal.getDestination(dest).then(function(explicitDest) {
                              if (explicitDest && explicitDest[0]) {
                                pdfDocGlobal.getPageIndex(explicitDest[0]).then(function(pageIdx) {
                                  indexDestMap.push({ rect: anno.rect, pdfPageIdx: pageIdx });
                                }).catch(console.error);
                              }
                            }).catch(console.error);
                          }
                        };
                        storeDestination(anno.dest);
                      }

                      const a = document.createElement('a');

                      const rect = unscaledViewport.convertToViewportRectangle(anno.rect);
                      const xMin = Math.min(rect[0], rect[2]);
                      const yMin = Math.min(rect[1], rect[3]);
                      const width = Math.abs(rect[2] - rect[0]);
                      const height = Math.abs(rect[3] - rect[1]);

                      a.style.left = (xMin / unscaledViewport.width * 100) + '%';
                      a.style.top = (yMin / unscaledViewport.height * 100) + '%';
                      a.style.width = (width / unscaledViewport.width * 100) + '%';
                      a.style.height = (height / unscaledViewport.height * 100) + '%';

                      if (anno.url) {
                        a.href = anno.url;
                        a.target = '_blank';
                      } else if (anno.dest) {
                        a.onclick = function(e) {
                          e.preventDefault();

                          if (Array.isArray(anno.dest)) {
                            pdfDocGlobal.getPageIndex(anno.dest[0]).then(function(pageIndex) {
                              scrollToPage(pageIndex + 1);
                            }).catch(console.error);
                          } else if (typeof anno.dest === 'string') {
                            pdfDocGlobal.getDestination(anno.dest).then(function(explicitDest) {
                              if (explicitDest && explicitDest[0]) {
                                pdfDocGlobal.getPageIndex(explicitDest[0]).then(function(pageIdx) {
                                  scrollToPage(pageIdx + 1);
                                }).catch(console.error);
                              }
                            }).catch(console.error);
                          }
                        };
                      }
                      annotationLayer.appendChild(a);
                    }
                  });
                });
              });
            }
          }).catch(function(error) {
            console.error('Error rendering PDF:', error);
            container.innerHTML = '<div class="loading">Failed to load protocol. Please try refreshing.</div>';
          });
      }
    }

    return () => {
      if(searchInput) searchInput.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  return (
    <div className="manual-lysis-container">
      <div className="search-container">
        <button className="search-btn" onClick={() => window.promptPageJump && window.promptPageJump()} aria-label="Jump to Page" style={{fontSize: '18px', background: '#444'}}>📄</button>
        <input type="text" id="searchInput" className="search-input" placeholder="Search or Pg#..." />
        <button className="search-btn" onClick={() => window.executeSearch && window.executeSearch()} aria-label="Search">🔍</button>
        <div id="searchInfo" className="search-input" style={{background: 'transparent', border: 'none', width: 'auto', textAlign: 'center', color: '#ddd'}}></div>
        <button className="search-nav-btn" id="prevMatchBtn" onClick={() => window.prevMatch && window.prevMatch()} aria-label="Previous Match" disabled>⬆️</button>
        <button className="search-nav-btn" id="nextMatchBtn" onClick={() => window.nextMatch && window.nextMatch()} aria-label="Next Match" disabled>⬇️</button>
      </div>

      <div className="zoom-controls">
        <button className="zoom-btn" onClick={() => window.zoomIn && window.zoomIn()} aria-label="Zoom In">+</button>
        <button className="zoom-btn" onClick={() => window.zoomOut && window.zoomOut()} aria-label="Zoom Out">−</button>
      </div>

      <div id="pdf-container">
        <div className="loading">Loading protocol...</div>
      </div>
    </div>
  );
};

export default ManualLysisView;
