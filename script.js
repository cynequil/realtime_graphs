const i_info = document.getElementById("i_info");
const n_info = document.getElementById("n_info");
const in_info = document.getElementById("in_info");
const ctx1 = document.getElementById("myChart1").getContext("2d");
const ctx2 = document.getElementById("myChart2").getContext("2d");
const ctx3 = document.getElementById("myChart3").getContext("2d");
const canvas1 = document.getElementById("myChart1");
const canvas2 = document.getElementById("myChart2");
const canvas3 = document.getElementById("myChart3");
const ratio_btn = document.getElementById("ratio_btn");
const data_btn = document.getElementById("data_btn");
const plot_btn = document.getElementById("plot_btn");
const coordinate = [];
const data = [];
let chart_data_cnt = 0;
let myChart1;
let myChart2;
let myChart3;

let start;
let prevTime;
let currentTime;
let timeFlag = false;
let I = 0;

const socket = new WebSocket("wss://coding-ws.astrome.co:2096");

socket.onopen = (e) => {
  start = Date.now();
  console.log("Connection open");
  render_chart();
};
socket.onmessage = (e) => {
  let ob = JSON.parse(e.data);
  ob = { ...ob, time: getTime() };
  coordinate.push(ob);
  if (isInside(ob)) {
    I = I + 1;
    let ratio = I / coordinate.length;
    data.push({
      time: Date.now() - start,
      ratio: ratio,
    });
  }
  console.log("Live data count: ", coordinate.length);
  i_info.value = I;
  n_info.value = coordinate.length;
  in_info.value = data[data.length - 1].ratio;
  myChart1.data.labels.push(data[data.length - 1].time);
  myChart1.data.datasets[0].data.push(data[data.length - 1].ratio);
  myChart1.update("quiet");
  myChart2.data.labels.push(coordinate[coordinate.length - 1].time);
  myChart2.data.datasets[0].data.push(coordinate[coordinate.length - 1].x);
  myChart2.data.datasets[1].data.push(coordinate[coordinate.length - 1].y);
  myChart2.update("quiet");
  myChart3.data.datasets[0].data.push(coordinate[coordinate.length - 1]);
  myChart3.update("quiet");
  chart_data_cnt = chart_data_cnt + 1;
  if (chart_data_cnt === 2) {
    console.log(chart_data_cnt);
    myChart1.data.labels.shift();
    myChart1.data.datasets[0].data.shift();
    myChart2.data.labels.shift();
    myChart2.data.datasets[0].data.shift();
    myChart2.data.datasets[1].data.shift();
    myChart3.data.datasets[0].data.shift();
    chart_data_cnt = 0;
    console.log(chart_data_cnt);
  }
  // if (coordinate.length === 500) socket.close();
};
socket.onerror = (e) => {
  console.log(e.error);
};
socket.onclose = (e) => {
  console.log(data);
  console.log("Connection Terminated");
};
//Event Handling
const handleClick = (id) => {
  if (id === "ratio_btn") {
    canvas1.style.zIndex = "100";
    canvas2.style.zIndex = "0";
    canvas3.style.zIndex = "0";
    ratio_btn.classList.add("active");
  }
  if (id === "data_btn") {
    canvas2.style.zIndex = "100";
    canvas1.style.zIndex = "0";
    canvas3.style.zIndex = "0";
  }
  if (id === "plot_btn") {
    canvas3.style.zIndex = "100";
    canvas2.style.zIndex = "0";
    canvas1.style.zIndex = "0";
  }
};
//Helper functions

const getTime = () => {
  if (!timeFlag) {
    prevTime = start;
    return Date.now() - prevTime;
  }
  return Date.now() - prevTime;
};
const extractTime = (arr) => {
  let time = arr.map((item) => item.time);
  return time;
};
const extractRatio = (arr) => {
  let ratio = arr.map((item) => item.ratio);
  return ratio;
};
const extractX = () => {
  let x = coordinate.map((item) => item.x);
  return x;
};
const extractY = () => {
  let y = coordinate.map((item) => item.y);
  return y;
};
const isInside = (ob) => {
  const rad = 1;
  if (ob.x * ob.x + ob.y * ob.y <= rad * rad) return true;
  else return false;
};
//Redering Chart
const render_chart = () => {
  //For ratio graph
  Chart.defaults.set("plugins.streaming", {
    duration: 20000,
  });
  myChart1 = new Chart(ctx1, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "I/N ratio",
          data: [],
          backgroundColor: "red",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Ratio Graph",
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
      },
    },
  });
  //For data graph
  myChart2 = new Chart(ctx2, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "x-coordinates",
          data: [],
          backgroundColor: "red",
          borderColor: "red",
        },
        {
          label: "y-coordinates",
          data: [],
          backgroundColor: "blue",
          borderColor: "blue",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Data Graph",
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
      },
    },
  });
  //For plot graph
  myChart3 = new Chart(ctx3, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "x-y values plot",
          data: [],
          backgroundColor: "green",
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
      },
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Plot Graph",
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
      },
    },
  });
  //Making ratio graph as the default graph
  canvas1.style.zIndex = "100";
};
