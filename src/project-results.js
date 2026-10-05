// The visible HTML tables are the source of truth for the chart values.
// Plotly is loaded only when a chart approaches the viewport.
(() => {
  const libraryUrl = new URL('../assets/vendor/plotly-basic-3.1.0.min.js', document.currentScript.src);
  const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  const colors = ['#087f8c', '#7154bf', '#a96112'];
  const config = { responsive: true, displayModeBar: false, scrollZoom: false };
  const interactedTables = new WeakSet();
  document.querySelectorAll('.result-data').forEach(details => {
    details.querySelector('summary').addEventListener('click', () => interactedTables.add(details));
  });
  let libraryPromise;

  function loadPlotly() {
    if (!libraryPromise) {
      libraryPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = libraryUrl.href;
        script.onload = () => resolve(window.Plotly);
        script.onerror = () => reject(new Error('Chart library could not be loaded.'));
        document.head.appendChild(script);
      });
    }
    return libraryPromise;
  }

  function layout() {
    return {
      autosize: true,
      font: { family: font, size: 14, color: '#435168' },
      paper_bgcolor: '#fff',
      plot_bgcolor: '#fff',
      margin: { l: 52, r: 18, t: 50, b: 54 },
      dragmode: false,
      legend: {
        orientation: 'h', x: 0, y: 1.12, yanchor: 'bottom',
        font: { size: 13 }, traceorder: 'normal'
      },
      hoverlabel: { font: { family: font, size: 14 }, bgcolor: '#fff' },
      xaxis: { fixedrange: true, zeroline: false, showline: true, linecolor: '#d7dee8', tickfont: { size: 13 } },
      yaxis: { fixedrange: true, zeroline: false, gridcolor: '#e8ecf1', tickfont: { size: 13 } }
    };
  }

  function loraChart() {
    const rows = [...document.querySelectorAll('#lora-data tbody tr')];
    const symbols = ['circle', 'square', 'diamond'];
    const traces = rows.map((row, i) => ({
      type: 'scatter', mode: 'lines+markers',
      name: `Rank ${row.querySelector('th').textContent.trim()}`,
      x: [0, 1, 2, 3],
      y: [...row.querySelectorAll('[data-loss]')].map(cell => Number(cell.textContent)),
      text: ['Baseline', 'Epoch 1', 'Epoch 2', 'Epoch 3'],
      line: { color: colors[i], width: 2.5 },
      marker: { color: colors[i], size: 8, symbol: symbols[i], line: { color: '#fff', width: 1 } },
      hovertemplate: '%{text}<br>Validation loss: %{y:.4f}<extra>%{fullData.name}</extra>'
    }));
    const chartLayout = layout();
    chartLayout.margin.r = 60;
    chartLayout.hovermode = 'x unified';
    Object.assign(chartLayout.xaxis, {
      title: { text: 'Training epoch', standoff: 12, font: { size: 14 } },
      tickvals: [0, 1, 2, 3], ticktext: ['Base', '1', '2', '3'],
      range: [-0.08, 3.12], showgrid: false
    });
    Object.assign(chartLayout.yaxis, {
      range: [3.5, 4.55], tick0: 3.6, dtick: 0.2, tickformat: '.1f'
    });
    chartLayout.annotations = traces.map((trace, i) => ({
      x: 3, y: trace.y[3], text: trace.y[3].toFixed(4),
      showarrow: false, xanchor: 'left', xshift: 10,
      yshift: [0, 4, -4][i], font: { color: colors[i], size: 12 }
    }));
    return { traces, layout: chartLayout };
  }

  function gcgChart() {
    const rows = [...document.querySelectorAll('#gcg-data tbody tr')];
    const traces = ['GCG', 'Random search'].map((name, i) => ({
      type: 'bar', orientation: 'h', name,
      y: rows.map(row => `Seed ${row.querySelector('th').textContent.trim()}`),
      x: rows.map(row => Number(row.querySelectorAll('td')[i].textContent)),
      marker: { color: colors[i] },
      texttemplate: '%{x:.3f}', textposition: 'outside', cliponaxis: false,
      textfont: { family: font, size: 13, color: '#243044' },
      hovertemplate: '%{y}<br>Final loss: %{x:.3f}<extra>%{fullData.name}</extra>'
    }));
    const chartLayout = layout();
    chartLayout.margin.l = 56;
    chartLayout.barmode = 'group';
    chartLayout.bargap = 0.3;
    chartLayout.bargroupgap = 0.16;
    Object.assign(chartLayout.xaxis, {
      title: { text: 'Final target-token loss', standoff: 12, font: { size: 14 } },
      range: [0, 9.2], tick0: 0, dtick: 2, gridcolor: '#e8ecf1'
    });
    Object.assign(chartLayout.yaxis, { autorange: 'reversed', showgrid: false });
    return { traces, layout: chartLayout };
  }

  const builders = { 'lora-chart': loraChart, 'gcg-chart': gcgChart };
  async function render(element) {
    const details = document.getElementById(element.id.replace('-chart', '-data'));
    try {
      const Plotly = await loadPlotly();
      const chart = builders[element.id]();
      element.hidden = false;
      await Plotly.newPlot(element, chart.traces, chart.layout, config);
      if (!interactedTables.has(details)) details.open = false;
      if ('ResizeObserver' in window) {
        let frame;
        const observer = new ResizeObserver(() => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => Plotly.Plots.resize(element));
        });
        observer.observe(element);
      }
    } catch (error) {
      // Retain readable, accessible results if the library or chart fails.
      element.hidden = true;
      details.open = true;
      console.warn('Using the results table instead of the chart.', error);
    }
  }

  const elements = [...document.querySelectorAll('.result-chart')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          render(entry.target.querySelector('.result-chart'));
        }
      }
    }, { rootMargin: '300px' });
    elements.forEach(element => observer.observe(element.parentElement));
  } else {
    elements.forEach(render);
  }
})();
