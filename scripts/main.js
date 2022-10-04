// -----------------DATA SOURCES ----------------
const urlRunData2021 =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTatXXTurZPUwtt5HDU6JKiFXx-WENl7eLX7dzR4kEc9HsID_U_I1wdVzHgKvclWP8TMtYkukXsMbde/pub?output=csv";

const urlRunData2022 =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxiF8ix4IEvtpMM-rTJiYFC1szu6DTSIvmpXLNo7jPoNp7Tma8BybwFjszDgXp-TU7eoxesahR8EI/pub?output=csv";

// -----------------GLOBAL VARIABLES & CONSTANTS ----------------
let currentUrl = urlRunData2022;
let currentYear = 2022;
let numberDaysYear = 365;
let yearlyTarget = 1000; 

// current date
const dateNow = new Date();

const nameMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// abbreviations for week days
const abbrWeekDays = ["M", "T", "W", "T", "F", "S", "S"];

// containers for run data
let arrayRuns = []; // all runs
let arrayIds = []; // run ids
let arrayDates = []; // run dates
let arrayDistances = []; // run distances
let arrayDurations = []; // run durations
let arraySpeeds = []; // run average speeds
let arrayPaces = []; // for run paces

let distancesMonths = []; // distances per each month
let runsPerMonth = []; // runs per each month
let distancesWeeks = []; // distances per each week

let mergedMonthsData; // formatted for D3 chart
let mergedWeeksData; // formatted for D3 chart

let allDays = [];
let runDays = [];

let distMonthTarget;
let distWeekTarget;

// percentage completed, percentage remaining
let dataYearProgress = [];
let dataMonthProgress = [];
let dataWeekProgress = [];
let procYearDone = 0;
let procMonthDone = 0;
let procWeekDone = 0;

// -----------------SELECT YEAR AND GET DATA ----------------
function selectYearData(selectedOption) {
  if (selectedOption == 2021) {
    currentUrl = urlRunData2021;
    currentYear = 2021;
  } else if (selectedOption == 2022) {
    currentUrl = urlRunData2022;
    currentYear = 2022;
  } else {
  }
  getSheetData();
}

function getSheetData() {
  Papa.parse(currentUrl, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const sheetData = results.data;

      // the array is emptied each time data for a new year is requested
      arrayRuns.length = 0;

      sheetData.forEach((row) =>
        arrayRuns.push({
          id: parseInt(row["ID"]),
          distance: parseFloat(row["Distance"]),
          date: row["Date"],
          time_h: parseInt(row["Hours"]),
          time_m: parseInt(row["Minutes"]),
          time_s: parseInt(row["Seconds"]),
        })
      );

      processData();
      generateCharts();
      generateTable();
    },
  });
}

// -----------------PROCESS DATA ----------------
function processData() {
  // function to get current week number
  function getWeekNum(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    // Return array of year and week number
    return weekNo;
  }

  // write current year, month, week for titles of donut charts
  let printedYear = currentYear === 2022 ? dateNow.getFullYear() : "2021";
  let printedMonth =
    currentYear === 2022 ? nameMonths[dateNow.getMonth()] : "December";
  let printedWeek = currentYear === 2022 ? "W" + getWeekNum(dateNow) : "W52";

  document.getElementById("current-year").innerHTML = printedYear;
  document.getElementById("current-month").innerHTML = printedMonth;
  document.getElementById("current-week").innerHTML = printedWeek;

  let yearlyAchieved = 0; // current year distance (km), initiated at 0
  let numberRuns = 0; // number of runs current year

  // calculate total duration ran in 2021
  let totTimeH = 0; // total number of hours (minutes and seconds added)
  let totTimeM = 0; // total number of minutes (no minutes over 60)
  let totTimeS = 0; // total number of seconds (no seconds over 60)
  let sumH = 0; // total number of hours (only from hours)
  let sumM = 0; // total number of minutes (only from minutes)
  let sumS = 0; // total number of seconds (only from seconds)

  // add leading zero for hours, minutes, seconds less than 10
  // force hh:mm:ss time format
  function leadingZero(x) {
    if (Number(x) < 10) {
      return "0" + x;
    } else {
      return String(x);
    }
  }

  // empty the arrays each time a new year is loaded
  arrayIds.length = 0;
  arrayDistances.length = 0;
  arrayDates.length = 0;
  arrayDurations.length = 0;
  arraySpeeds.length = 0;
  arrayPaces.length = 0;

  // read the JSON containing data on runs and populate arrays with data
  for (let i = 0; i < arrayRuns.length; i++) {
    arrayIds.push(arrayRuns[i]["id"]); // add ids to array
    arrayDates.push(arrayRuns[i]["date"]); // keep yyyy-mm-dd
    arrayDistances.push(arrayRuns[i]["distance"].toFixed(2));

    // duration of run in hours
    let durHours = arrayRuns[i]["time_h"]; // hours for run i
    let durMinutes = arrayRuns[i]["time_m"]; // minutes for run i
    let durSeconds = arrayRuns[i]["time_s"]; // seconds for run i

    sumH += durHours; // sum hours
    sumM += durMinutes; // sum minutes
    sumS += durSeconds; // sum seconds

    // duration in hours for run i
    let durRunHours = durHours + durMinutes / 60 + durSeconds / 3600;

    // construct the duration in hh:mm:ss format for each run
    let durRun =
      leadingZero(durHours) +
      ":" +
      leadingZero(durMinutes) +
      ":" +
      leadingZero(durSeconds);
    arrayDurations.push(durRun); // populate array of durations

    // calculate speed of run in km/h
    let speedRun = (arrayRuns[i]["distance"] / durRunHours).toFixed(1);
    arraySpeeds.push(speedRun); // populate array of speeds

    // calculate pace of run in min/km
    let durRunMinutes = durHours * 60 + durMinutes + durSeconds / 60; // total duration in minutes
    let paceRaw = durRunMinutes / arrayRuns[i]["distance"];
    let paceMinutes = Math.floor(paceRaw); // the minutes component
    let paceSeconds = leadingZero(
      Math.floor((paceRaw - Math.floor(paceRaw)) * 60)
    ); // seconds component
    let paceRun = paceMinutes + ":" + paceSeconds; // merge minutes and seconds components
    arrayPaces.push(paceRun); // populate array of paces
  }

  // sum distances to obtain current year distance
  yearlyAchieved = 0; // clear previous data

  for (i in arrayDistances) {
    yearlyAchieved += Number(arrayDistances[i]);
    numberRuns++;
  }

  procYearDone = yearlyAchieved / yearlyTarget; // percentage completed
  let procYearRemain = 1 - procYearDone; // percentage remaining

  dataYearProgress.length = 0; // clear previous data
  dataYearProgress.push(procYearDone);
  dataYearProgress.push(procYearRemain);

  // --------------------DATA FOR MONTHS CHARTS --------------------
  // clear data from previous year
  distancesMonths.length = 0;
  runsPerMonth.length = 0;

  // initiate distance and number of runs to 0 for all months
  // variables are created as properties of the global Window object
  nameMonths.forEach((name) => {
    distancesMonths.push((window["dist" + name.slice(0, 3)] = 0));
    runsPerMonth.push((window["runs" + name.slice(0, 3)] = 0));
  });

  // count km and number of runs per each month
  for (let i = 0; i < arrayRuns.length; i++) {
    let fullDateRun = new Date(arrayRuns[i]["date"]);
    let monthRun = fullDateRun.getMonth();
    let distRun = Number(arrayRuns[i]["distance"]);

    distancesMonths[monthRun] += distRun;
    runsPerMonth[monthRun] += 1;
  }

  // number of weeks each month has
  // needed when placing month labels on top of the streak chart
  let monthLabels = [0, 4, 8, 13, 17, 22, 26, 30, 35, 39, 43, 48];

  // merge the three arrays to prepare new array for D3
  // needed in order to display multiple text labels
  mergedMonthsData = d3.zip(
    distancesMonths,
    nameMonths,
    runsPerMonth,
    monthLabels
  );

  let distMonthDone = distancesMonths[dateNow.getMonth()]; // total distance current month

  distMonthTarget =
    (yearlyTarget - (yearlyAchieved - distMonthDone)) /
    (12 - dateNow.getMonth()); // target distance month

  let distMonthRemain = 0;
  let procMonthRemain = 0;

  // handle percentages over 100%
  // when monthly target is exceeded, percentage is capped at 100%
  if (distMonthDone <= distMonthTarget) {
    distMonthRemain = distMonthTarget - distMonthDone;
    procMonthDone = distMonthDone / distMonthTarget;
    procMonthRemain = 1 - procMonthDone;
  } else {
    distMonthRemain = 0;
    procMonthDone = 1;
    procMonthRemain = 0;
  }

  dataMonthProgress.length = 0; // clear previous data
  dataMonthProgress.push(procMonthDone);
  dataMonthProgress.push(procMonthRemain);

  // --------------------DATA FOR WEEKS CHARTS --------------------
  // clear data from previous year
  distancesWeeks.length = 0;

  // generate week names
  let nameWeeks = [];
  for (let i = 0; i < 52; i++) {
    nameWeeks.push("W" + (i + 1));
  }

  // initiate distances to 0 for all weeks
  // variables are created as properties of the global Window object
  nameWeeks.forEach((name) => {
    distancesWeeks.push((window["dist" + name] = 0));
  });

  // count km per each week
  for (let i = 0; i < arrayRuns.length; i++) {
    let fullDateRun = new Date(arrayRuns[i]["date"]);
    let weekRun = getWeekNum(fullDateRun);
    let distRun = Number(arrayRuns[i]["distance"]);

    distancesWeeks[weekRun - 1] += distRun;
  }

  // merge the two arrays to prepare new array for D3
  // needed in order to display both values and names
  mergedWeeksData = d3.zip(distancesWeeks, nameWeeks);

  let distWeekDone = distancesWeeks[getWeekNum(dateNow) - 1]; // distance current week
  distWeekTarget =
    (yearlyTarget - (yearlyAchieved - distWeekDone)) /
    (52 - getWeekNum(dateNow) - 1);

  let distWeekRemain = 0;
  let procWeekRemain = 0;

  // handle percentages over 100%
  // when weekly target is exceeded, weekly percentage is capped at 100%
  if (distWeekDone <= distWeekTarget) {
    distWeekRemain = distWeekTarget - distWeekDone;
    procWeekDone = distWeekDone / distWeekTarget;
    procWeekRemain = 1 - procWeekDone;
  } else {
    distWeekRemain = 0;
    procWeekDone = 1;
    procWeekRemain = 0;
  }

  dataWeekProgress.length = 0; //clear previous data
  dataWeekProgress.push(procWeekDone);
  dataWeekProgress.push(procWeekRemain);
}

// -----------------GENERATE CHARTS ----------------
function generateCharts() {
  // ----------------MONTHLY DISTANCES - COLUMN CHART------------------
  // empty the container chart to create a new one with a new width
  document.getElementById("month-distances-svg").innerHTML = "";

  // get the new width of the container that will hold the chart
  let newChartWidth1 = document.getElementById(
    "month-distances-svg"
  ).clientWidth;

  let wMonChart = newChartWidth1 - 35; // width of svg container for chart
  let hMonChart = 350; // height of svg container for chart

  // define x scale
  let xScaleMonth = d3
    .scaleBand()
    .domain(d3.range(12))
    .rangeRound([0, wMonChart])
    .round(true)
    .paddingInner(0.1);

  // define y scale
  let yScaleMonth = d3
    .scaleLinear()
    .domain([0, d3.max(distancesMonths) + 10]) // +10 to show labels above
    .range([80, hMonChart]);

  // create SVG element
  let svgMonth = d3
    .select("#month-distances-svg") // select by id
    .append("svg") // insert the <svg> inside the selected <div>
    .attr("width", wMonChart) // assign width
    .attr("height", hMonChart) // assign height
    .attr("id", "month-distances-chart"); // assign id

  // create horizontal line for monthly target
  let lineTarget = d3
    .axisBottom()
    .scale(xScaleMonth)
    .tickValues([])
    .tickSize(0);
  svgMonth
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + (hMonChart - yScaleMonth(83)) + ")")
    .call(lineTarget);

  // create <g> for each month
  let months = svgMonth.selectAll("g.month").data(mergedMonthsData);
  let monthsEnter = months.enter().append("g").classed("month", true);
  // create the <rect> elements
  monthsEnter
    .append("rect")
    .attr("x", function (d, i) {
      return xScaleMonth(i);
    })
    .attr("y", function (d) {
      return hMonChart - yScaleMonth(d[0]);
    })
    .attr("width", xScaleMonth.bandwidth())
    .attr("height", function (d) {
      return yScaleMonth(d[0]) - 70; // -70 to position labels below chart
    })
    // color month columns according to performance
    .attr("fill", function (d) {
      if (d[0] == 0) {
        return "#D1D1D1";
      } else if (d[0] < 80) {
        return "#09990C"; // changed to using the same color
      } else {
        return "#09990C"; // changed to using the same color
      }
    })
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px");

  // text labels for monthtly distance
  monthsEnter
    .append("text")
    .attr("class", "month-values") // assign a CSS class
    .text(function (d) {
      return d[0].toFixed(0);
    })
    .attr("x", function (d, i) {
      return xScaleMonth(i) + xScaleMonth.bandwidth() / 2;
    })
    .attr("y", function (d) {
      return hMonChart - yScaleMonth(d[0]) - 10;
    });

  // tooltips
  monthsEnter.append("title").text(function (d, i) {
    return d[0].toFixed(0) + " km " + "\n\n" + d[2] + " runs";
  });

  // text labels for month names
  monthsEnter
    .append("text")
    .attr("class", "month-names") // assign a CSS class
    .text(function (d) {
      // retrieve text from array
      return d[1];
    })
    // SVG operation to rotate having (x,y) as origin
    .attr("transform", function (d, i) {
      let xText = xScaleMonth(i) + xScaleMonth.bandwidth() / 2 + 4; // x position of text
      let yText = 345; // y position of text
      return "translate(" + xText + ", " + yText + ") rotate(-90)";
    });

  // ----------------WEEKLY DISTANCES - COLUMN CHART------------------

  // empty the container to create a new one with a new width
  document.getElementById("week-distances-svg").innerHTML = "";

  // get the new width of the container that will hold the chart
  let newChartWidth3 = document.getElementById("week-distances").clientWidth;

  let wWeekChart = newChartWidth3; // width of svg container for chart
  let hWeekChart = 250; // height of svg container for chart
  // define x scale
  let xScaleWeek = d3
    .scaleBand()
    .domain(d3.range(distancesWeeks.length))
    .rangeRound([-10, wWeekChart - 20])
    .round(true)
    .paddingInner(0.25);
  // define y scale
  let yScaleWeek = d3
    .scaleLinear()
    .domain([0, d3.max(distancesWeeks) + 10])
    .range([5, hWeekChart]);

  // Create SVG element
  let svgWeek = d3
    .select("#week-distances-svg") // select by id
    .append("svg") // insert the <svg> inside the selected <div>
    .attr("width", wWeekChart) // assign width
    .attr("height", hWeekChart) // assign height
    .attr("id", "week-distances-chart"); // assign id

  // create horizontal line for weekly target
  let lineTargetWeek = d3
    .axisBottom()
    .scale(xScaleWeek)
    .tickValues([])
    .tickSize(0);
  svgWeek
    .append("g")
    .attr("class", "grid")
    // position line at the 20km/week value
    .attr(
      "transform",
      "translate(0," + (hWeekChart - yScaleWeek(20) - 40) + ")"
    )
    .call(lineTargetWeek);

  // create <g> for each week
  let weeks = svgWeek.selectAll("g.week").data(mergedWeeksData);
  let weeksEnter = weeks.enter().append("g").classed("week", true);
  // create the <rect> elements
  weeksEnter
    .append("rect")
    .attr("x", function (d, i) {
      return xScaleWeek(i);
    })
    .attr("y", function (d) {
      return hWeekChart - yScaleWeek(d[0]) - 40;
    })
    .attr("width", xScaleWeek.bandwidth())
    .attr("height", function (d) {
      return yScaleWeek(d[0]); // -40 to position labels below chart
    })
    // color week columns according to performance
    .attr("fill", function (d) {
      if (d[0] == 0) {
        return "#D1D1D1";
      } else if (d[0] < 19) {
        return "#09990C";
      } else {
        return "#09990C";
      }
    })
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px");

  // text labels for weekly distance
  weeksEnter
    .append("text")
    .attr("class", "week-values") // assign a CSS class
    .text(function (d) {
      return d[0].toFixed(0);
    })
    .attr("text-anchor", "middle")
    .attr("x", function (d, i) {
      return xScaleWeek(i) + xScaleWeek.bandwidth() / 2;
    })
    .attr("y", function (d) {
      return hWeekChart - yScaleWeek(d[0]) - 45;
    });

  // tooltips
  weeksEnter.append("title").text(function (d, i) {
    return d[0].toFixed(0) + " km";
  });

  // text labels for week names
  weeksEnter
    .append("text")
    .attr("class", "week-names") // assign a CSS class
    .text(function (d) {
      // retrieve text from array
      return d[1];
    })
    // SVG operation to rotate having (x,y) as origin
    .attr("transform", function (d, i) {
      let xText = xScaleWeek(i) + xScaleWeek.bandwidth() / 2 + 4; // x position of text
      let yText = 240; // y position of text
      return "translate(" + xText + ", " + yText + ") rotate(-90)";
    });

  // -----------------CALENDAR VIEW-----------------
  // empty the container to create a new chart with a new width
  document.getElementById("daily-streak-svg").innerHTML = "";

  // get the new width of the container that will hold the chart
  let streakChartW = document.getElementById("daily-streak-svg").clientWidth;
  // set cell size to be proportional to chart size in order to scale
  let cellSize = (streakChartW - 55) / 53; // cell size
  // set the height of the chart to be proportional to the cell size (and width of container)
  let streakChartH = cellSize * 7 + 50; // height of SVG container

  // let wDayChart = 1178; // with of SVG container

  let format = d3.timeFormat("%Y-%m-%d");

  // associate two color classes to the values 0 and 1
  let color = d3
    .scaleQuantize()
    .domain([0, 1])
    .range(
      d3.range(2).map(function (d) {
        return "q" + d;
      })
    );

  let svgDay = d3
    .select("#daily-streak-svg")
    .selectAll("daily-streak-svg")
    // .data(d3.range(2021, 2022)) // returns 2021
    .data(d3.range(currentYear, currentYear + 1))
    .enter()
    .append("svg")
    .attr("width", streakChartW)
    .attr("height", streakChartH)
    .attr("class", "day-status")
    .attr("id", "daily-streak-chart")
    .append("g")
    .attr("transform", "translate(20, 30)");

  // make Monday first day of week
  // initially Sunday = 0, Monday = 1, ..., Saturday = 6
  // after Sunday = 6, Monday = 0, ..., Saturday = 5
  function mondayFirst(x) {
    switch (x) {
      case 0:
        return 6;
        break;
      case 1:
        return 0;
        break;
      case 2:
        return 1;
        break;
      case 3:
        return 2;
        break;
      case 4:
        return 3;
        break;
      case 5:
        return 4;
        break;
      case 6:
        return 5;
        break;
      default:
        return 0;
        break;
    }
  }

  // create the cells representing the days
  let rect = svgDay
    .selectAll(".day")
    .data(function (d) {
      return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    }) // return all the dates in between two given dates
    .enter()
    .append("rect")
    .attr("class", "day")
    .attr("width", cellSize) // width of cell
    .attr("height", cellSize) // height of cell
    // x coord of each cell
    .attr("x", function (d) {
      // if day is Sunday, shift those cells to the left to fix
      if (d.getDay() === 0) {
        return d3.timeWeek.count(d3.timeYear(d), d) * cellSize - cellSize;
      }
      // else (days are not Sundays), print as usual
      else {
        return d3.timeWeek.count(d3.timeYear(d), d) * cellSize;
      }
    })
    // y coordinates of each cell
    .attr("y", function (d) {
      return mondayFirst(d.getDay()) * cellSize;
    })
    // getDay() method returns the day of the week (Sunday 0, Monday 1)
    // apply mondayFirst() function to shift cells correctly
    .datum(format);

  // place day of month inside the cell
  let dayNumber = svgDay
    .selectAll("g.month-day-streak")
    .data(function (d) {
      return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    }) // return all the dates in between two given dates
    .enter()
    .append("text")
    .text(function (d) {
      return String(d).split(" ")[2];
      // split the full date into an array at empty space (" ")
      // output the third element of the array (the day of month)
    })
    .attr("class", "month-day-streak")
    .attr("text-anchor", "middle")
    .attr("x", function (d) {
      // if day is Sunday, shift those labels to the left to fix
      if (d.getDay() === 0) {
        return (
          d3.timeWeek.count(d3.timeYear(d), d) * cellSize +
          cellSize / 2 -
          cellSize
        );
      }
      // else (days are not Sundays), print as usual
      else {
        return d3.timeWeek.count(d3.timeYear(d), d) * cellSize + cellSize / 2;
      }
    })
    // y coordinates of the day number text
    .attr("y", function (d) {
      return mondayFirst(d.getDay()) * cellSize + cellSize / 2 + 3;
    });

  // place names of months above chart
  svgDay
    .selectAll("g.month-name-streak")
    .data(mergedMonthsData)
    .enter()
    .append("text")
    .text(function (d) {
      return d[1];
    })
    .attr("class", "month-name-streak")
    .attr("text-anchor", "middle")
    .attr("x", function (d, i) {
      return cellSize * (3 + d[3]); // align month names to cells
    })
    .attr("y", "-10");

  // place day of week to the left of the chart
  svgDay
    .selectAll("g.week-day")
    .data(abbrWeekDays)
    .enter()
    .append("text")
    .text(function (d) {
      return d;
    })
    .attr("class", "week-day")
    .attr("text-anchor", "middle")
    .attr("x", "-15")
    .attr("y", function (d, i) {
      return 15 + i * cellSize;
    });

  // create the tooltips with date of cell
  rect.append("title").text(function (d) {
    return d;
  });

  // color the cells according to rules (if you ran that day)
  rect.attr("class", function (d) {
    if (arrayRuns.find((x) => x.date === d)) {
      return "day q1";
    } else {
      return "day q0";
    }
  });

  // create the month thicker delimitations
  // d3.timeMonths(start, end) returns all dates in the given range of start, end
  svgDay
    .selectAll(".month-group")
    .data(function (d) {
      return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
    .enter()
    .append("path")
    .attr("class", "month-group")
    .attr("d", monthPath);

  // create the outline of the month with SVG path commands
  function monthPath(t0) {
    let t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
    let d0 = mondayFirst(t0.getDay());
    let d1 = mondayFirst(t1.getDay());
    let oldW0 = d3.timeWeek.count(d3.timeYear(t0), t0);
    let oldW1 = d3.timeWeek.count(d3.timeYear(t1), t1);

    // functions to fix week number
    // are needed because d3.timeWeek considers Sunday first day of week
    // w0 controls vertical left line
    // w1 controls vertical right line
    // to-do: find more elegant solution to work on all years
    function fixW0() {
      if (currentYear === 2021) {
        if (oldW0 === 31) {
          w0 = oldW0 - 1;
        } else {
          w0 = oldW0;
        }
      } else if (currentYear === 2022) {
        if (oldW0 === 18) {
          w0 = oldW0 - 1;
        } else {
          w0 = oldW0;
        }
      } else {
        w0 = oldW0;
      }

      return w0;
    }
    fixW0();

    function fixW1() {
      if (currentYear === 2021) {
        if (oldW1 === 5 || oldW1 === 9 || oldW1 === 44) {
          w1 = oldW1 - 1;
        } else {
          w1 = oldW1;
        }
      } else if (currentYear === 2022) {
        if (oldW1 === 31) {
          w1 = oldW1 - 1;
        } else {
          w1 = oldW1;
        }
      } else {
        w1 = oldW1;
      }

      return w1;
    }
    fixW1();

    return (
      "M" +
      (w0 + 1) * cellSize +
      "," +
      d0 * cellSize +
      "H" +
      w0 * cellSize +
      "V" +
      7 * cellSize +
      "H" +
      w1 * cellSize +
      "V" +
      (d1 + 1) * cellSize +
      "H" +
      (w1 + 1) * cellSize +
      "V" +
      0 +
      "H" +
      (w0 + 1) * cellSize +
      "Z"
    );
  }

  // --------------------PROGRESS DONUT CHARTS--------------------
  // empty the container to create a new chart with a new width
  document.getElementById("yearly-progress-svg").innerHTML = "";

  let wDonChart = 150; // width of SVG for donut charts
  let hDonChart = 150; // height of SVG for donut charts
  let xPercent = wDonChart / 2;
  let yPercent = hDonChart / 2;
  let outerRadius = wDonChart / 2.2; // outer radius of donut
  let innerRadius = wDonChart / 3.5; // inner radius of donut

  // YEARLY PROGRESS DONUT CHART
  let arcY = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  let pieY = d3.pie();

  // create SVG element
  let svgY = d3
    .select("#yearly-progress-svg") // select by id
    .append("svg") // insert the <svg> inside the selected <div>
    // .attr("width", wDonChart) // width of SVG container
    // .attr("height", hDonChart) // height of SVG container
    .attr("id", "yearly-chart")
    .attr("preserveAspectRatio", "xMinYMin meet") // needed to resize chart with window
    .attr("viewBox", "0 0 150 150"); // needed to resize chart with window

  // set up groups
  let arcsY = svgY
    .selectAll("g.arc")
    .data(pieY(dataYearProgress))
    .enter()
    .append("g") // create each group
    .attr("class", "arc")
    .attr(
      "transform",
      "translate(" + wDonChart / 2 + "," + hDonChart / 2 + ")"
    );

  // draw arc paths
  arcsY
    .append("path")
    // color percentages
    .attr("fill", function (d, i) {
      if (i == 0) {
        return "#09990C";
      } else {
        return "#D1D1D1";
      }
    })
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px")
    .attr("d", arcY)
    .append("title")
    .text(function (d, i) {
      return (dataYearProgress[i] * 1000).toFixed(1) + " km";
    });

  // label for percentage completed (middle of donut)
  svgY
    .append("text")
    .attr("class", "percentage")
    .attr("x", xPercent)
    .attr("y", yPercent + 10)
    .text((procYearDone * 100).toFixed(0) + " %");
  // -------------------------------------------------------------------------------

  // MONTHLY PROGRESS DONUT CHART

  // empty the container to create a new chart with a new width
  document.getElementById("monthly-progress-svg").innerHTML = "";

  let arcM = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  let pieM = d3.pie();

  // create SVG element
  let svgM = d3
    .select("#monthly-progress-svg") // select by id
    .append("svg") // insert the <svg> inside the selected <div>
    // .attr("width", wDonChart) // width of SVG container
    // .attr("height", hDonChart) // height of SVG container
    .attr("id", "yearly-chart")
    .attr("preserveAspectRatio", "xMinYMin meet") // needed to resize chart with window
    .attr("viewBox", "0 0 150 150"); // needed to resize chart with window

  // set up groups
  var arcsM = svgM
    .selectAll("g.arc")
    .data(pieM(dataMonthProgress))
    .enter()
    .append("g") // create each group
    .attr("class", "arc")
    .attr(
      "transform",
      "translate(" + wDonChart / 2 + "," + hDonChart / 2 + ")"
    );

  // draw arc paths
  arcsM
    .append("path")
    // color percentages
    .attr("fill", function (d, i) {
      if (i == 0) {
        return "#09990C";
      } else {
        return "#D1D1D1";
      }
    })
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px")
    .attr("d", arcM)
    .append("title")
    .text(function (d, i) {
      return (dataMonthProgress[i] * distMonthTarget).toFixed(1) + " km";
    });

  // label for percentage completed (middle of donut)
  svgM
    .append("text")
    .attr("class", "percentage")
    .attr("x", xPercent)
    .attr("y", yPercent + 10)
    .text((procMonthDone * 100).toFixed(0) + " %");
  // -------------------------------------------------------------------------------

  // WEEKLY PROGRESS DONUT CHART

  // empty the container to create a new chart with a new width
  document.getElementById("weekly-progress-svg").innerHTML = "";

  let arcD = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  let pieD = d3.pie();

  // create SVG element
  let svgD = d3
    .select("#weekly-progress-svg") // select by id
    .append("svg") // insert the <svg> inside the selected <div>
    // .attr("width", wDonChart) // width of SVG container
    // .attr("height", hDonChart) // height of SVG container
    .attr("id", "yearly-chart")
    .attr("preserveAspectRatio", "xMinYMin meet") // needed to resize chart with window
    .attr("viewBox", "0 0 150 150"); // needed to resize chart with window

  // set up groups
  var arcsD = svgD
    .selectAll("g.arc")
    .data(pieD(dataWeekProgress))
    .enter()
    .append("g") // create each group
    .attr("class", "arc")
    .attr(
      "transform",
      "translate(" + wDonChart / 2 + "," + hDonChart / 2 + ")"
    );

  // draw arc paths
  arcsD
    .append("path")
    // color percentages
    .attr("fill", function (d, i) {
      if (i == 0) {
        return "#09990C";
      } else {
        return "#D1D1D1";
      }
    })
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px")
    .attr("d", arcD)
    .append("title")
    .text(function (d, i) {
      return (dataWeekProgress[i] * distWeekTarget).toFixed(1) + " km";
    });

  // label for percentage completed (middle of donut)
  svgD
    .append("text")
    .attr("class", "percentage")
    .attr("x", xPercent)
    .attr("y", yPercent + 10)
    .text((procWeekDone * 100).toFixed(0) + " %");
}

// -----------------GENERATE TABLES ----------------
function generateTable() {
  let divNewTable = document.getElementById("table-data"); // table container
  divNewTable.innerHTML = ""; // empty the table before calling update

  document.getElementById("table-data").style.height = "auto";
  const tableHeaders = [
    "Run ID",
    "Run Date (yyyy&#8209;mm&#8209;dd)",
    "Distance (km)",
    "Duration (hh:mm:ss)",
    "Speed (km/h)",
    "Pace (min/km)",
  ];

  let tableRuns = document.createElement("table"); // create table element
  tableRuns.id = "table-runs"; // assign id to table
  let tr = tableRuns.insertRow(-1); // insert the first row

  for (let i = 0; i < tableHeaders.length; i++) {
    let th = document.createElement("th"); // create the table headers
    tr.appendChild(th); // assign the headers in the first table row
    // th.innerHTML = tableHeaders[i];
    switch (i) {
      case 1:
        th.outerHTML =
          "<th onclick=" +
          "sortTableDate(" +
          i +
          ") title='Click to Sort'>" +
          tableHeaders[i] +
          "</th>";
        break;
      case 5:
        th.outerHTML =
          "<th onclick=" +
          "sortTablePace(" +
          i +
          ") title='Click to Sort'>" +
          tableHeaders[i] +
          "</th>";
        break;
      default:
        th.outerHTML =
          "<th onclick=" +
          "sortTableNumber(" +
          i +
          ") title='Click to Sort'>" +
          tableHeaders[i] +
          "</th>";
        break;
    }
  }

  // use max to avoid empty fields
  let maxSize = Math.max(
    arrayIds.length,
    arrayDates.length,
    arrayDistances.length,
    arraySpeeds.length,
    arrayDurations.length
  );

  // populate each row with data
  // iterate in this odd way to show the most recent run first
  for (let i = maxSize - 1; i >= 0; i--) {
    tr = tableRuns.insertRow(-1); // add table row
    let cell1 = tr.insertCell(-1); // create cell
    cell1.innerHTML = arrayIds[i]; // add id to cell
    let cell2 = tr.insertCell(-1); // create cell
    cell2.innerHTML = arrayDates[i]; // add date to cell
    let cell3 = tr.insertCell(-1); // create cell
    cell3.innerHTML = arrayDistances[i]; // add distance to cell
    let cell4 = tr.insertCell(-1); // create cell
    cell4.innerHTML = arrayDurations[i]; // add duration to cell
    let cell5 = tr.insertCell(-1); // create cell
    cell5.innerHTML = arraySpeeds[i]; // add speed to cell
    let cell6 = tr.insertCell(-1); // create cell
    cell6.innerHTML = arrayPaces[i]; // add pace to cell
  }

  divNewTable.innerHTML = ""; // empty the table before calling update
  divNewTable.appendChild(tableRuns); // write the table
}

// sort table by columns which have numbers
function sortTableNumber(n) {
  let tableRuns = document.getElementById("table-runs");
  let switchcount = 0;
  let switching = true;
  let dir = "asc";
  let shouldSwitch = true;
  let i;

  while (switching) {
    switching = false;
    let rows = tableRuns.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      let x = rows[i].getElementsByTagName("TD")[n];
      let y = rows[i + 1].getElementsByTagName("TD")[n];
      if (dir == "asc") {
        if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

// sort table by columns which have dates
function sortTableDate(n) {
  let tableRuns = document.getElementById("table-runs");
  let switchcount = 0;
  let switching = true;
  let dir = "asc";
  let shouldSwitch = true;
  let i;

  while (switching) {
    switching = false;
    let rows = tableRuns.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      let x = rows[i].getElementsByTagName("TD")[n];
      let y = rows[i + 1].getElementsByTagName("TD")[n];
      if (dir == "asc") {
        if (Date.parse(x.innerHTML) > Date.parse(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (Date.parse(x.innerHTML) < Date.parse(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

// sort table by pace (for pace column)
function sortTablePace(n) {
  let tableRuns = document.getElementById("table-runs");
  let switchcount = 0;
  let switching = true;
  let dir = "asc";
  let shouldSwitch = true;
  let i;

  while (switching) {
    switching = false;
    let rows = tableRuns.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      let x = rows[i].getElementsByTagName("TD")[n];
      let y = rows[i + 1].getElementsByTagName("TD")[n];

      let xX = x.innerHTML.split(":"); // split mm:ss at ":" in an array
      let xSec = xX[0] * 60 + xX[1]; // count total of seconds per km

      let yY = y.innerHTML.split(":"); // split mm:ss at ":" in an array
      let ySec = yY[0] * 60 + yY[1]; // count total of seconds per km

      if (dir == "asc") {
        if (parseFloat(xSec) > parseFloat(ySec)) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (parseFloat(xSec) < parseFloat(ySec)) {
          shouldSwitch = true;
          break;
        }
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

// call main function
getSheetData();

// when the window is resized the chart is redrawn to fit
window.addEventListener("resize", generateCharts);
