// --------------------DATA--------------------
const dateNow = new Date(); // current date
const nameMonths = ["January", "February", "March", "April", "May", "June", 
"July", "August", "September", "October", "November", "December"];

// function to get current week number
function getWeekNum(d) { 
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
  // Return array of year and week number
  return weekNo;
}

// DATA FOR YEARS
let currYear = dateNow.getFullYear(); // current year
let currMonth = nameMonths[dateNow.getMonth()]; // current month
let currWeek = "W" + getWeekNum(dateNow); // current week

// write current year, month, week for titles of donut charts
let cY = document.getElementById("current-year");
cY.innerHTML = currYear;
let cM = document.getElementById("current-month");
cM.innerHTML = currMonth;
let cW = document.getElementById("current-week");
cW.innerHTML = currWeek;

let arrayId = []; // array for run ids
let arrayDate = []; // array for run dates
let arrayDistance = []; // array for run distances
let arrayDuration = []; // array for run durations
let arraySpeed = []; // array for run average speeds
let arrayPace = []; // array for run paces

let yearlyTarget = 1000; // annual distance target (km)
let yearlyAchieved = 0; // current year distance (km), initiated at 0
let numberRuns = 0; // number of runs current year
let totalTime = "00:00:00"; // total duration run current year
let avgPace = "0:00"; // average pace for entire year

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
  if(Number(x) < 10) {
      return '0' + x;
  } else {
      return String(x);
  }
}

// read the JSON containing data on runs and populate arrays with data
for(let i = 0; i < arrayRuns.length; i++) {
	arrayId.push(arrayRuns[i]["id"]); // add ids to array
	arrayDate.push(arrayRuns[i]["date"]); // keep yyyy-mm-dd
	arrayDistance.push(arrayRuns[i]["distance"].toFixed(2)); 
	
	// duration of run in hours
	let durHours = arrayRuns[i]["time_h"]; // hours for run i
	let durMinutes = arrayRuns[i]["time_m"]; // minutes for run i
	let durSeconds = arrayRuns[i]["time_s"]; // seconds for run i

	sumH += durHours; // sum hours
	sumM += durMinutes; // sum minutes
	sumS += durSeconds; // sum seconds

	// duration in hours for run i
	let durRunHours = durHours + durMinutes / 60 
									+ durSeconds / 3600;
	
	// construct the duration in hh:mm:ss format for each run
	let durRun = leadingZero(durHours) + ":" + leadingZero(durMinutes) +":" + leadingZero(durSeconds);
	arrayDuration.push(durRun); // populate array of durations 

	// calculate speed of run in km/h
	let speedRun = (arrayRuns[i]["distance"] / durRunHours).toFixed(1); 
	arraySpeed.push(speedRun); // populate array of speeds

	// calculate pace of run in min/km
	let durRunMinutes = durHours * 60 + durMinutes + durSeconds / 60; // total duration in minutes
	let paceRaw = durRunMinutes / arrayRuns[i]["distance"];
	let paceMinutes = Math.floor(paceRaw); // the minutes component 
	let paceSeconds = leadingZero(Math.floor((paceRaw - Math.floor(paceRaw)) * 60)); // seconds component
	let paceRun = paceMinutes + ":" + paceSeconds; // merge minutes and seconds components
	arrayPace.push(paceRun); // populate array of paces
}

// total number of minutes 
let totMinutes = sumH * 60 + sumM + sumS / 60;

// count hours, minutes, seconds
// convert to hh:mm:ss

if (sumS >= 60) { // if more than 60 seconds
	let minFromSec = Math.floor(sumS / 60);
	totTimeS = Math.floor(sumS - (minFromSec * 60));
	sumM = sumM + minFromSec;

	if (sumM >= 60) { // if more than 60 minutes
		let hourFromMin = Math.floor(sumM / 60);
		totTimeM = Math.floor(sumM - (hourFromMin * 60));
		sumH = sumH + hourFromMin;
		totTimeH = sumH;
		totTimeH = sumH;
	}

	else { // if less than 60 minutes
		totTimeM = sumM;
	}
}

else { // if less than 60 seconds
	totTimeS = sumS;

	if (sumM >= 60) { // if more than 60 minutes
		let hourFromMin = Math.floor(sumM / 60);
		totTimeM = Math.floor(sumM - (hourFromMin * 60));
		sumH = sumH + hourFromMin;
		totTimeH = sumH;
	}

	else { // if less than 60 minutes
		totTimeM = sumM;
		totTimeH = sumH;
	}
}

// sum distances to obtain current year distance 
for(i in arrayDistance) {
	yearlyAchieved += Number(arrayDistance[i]);
	numberRuns ++;
}

// average running distance per year
let avgRunDist = yearlyAchieved / numberRuns;

// average pace per year
let avgPaceRaw = totMinutes / yearlyAchieved; 
let avgPaceMin = Math.floor(avgPaceRaw);
let avgPaceSec = avgPaceRaw - avgPaceMin;
avgPace = avgPaceMin + ":" + (avgPaceSec * 60).toFixed(0);


let yearlyNeeded = yearlyTarget - yearlyAchieved; // remaining year distance 
let procYearDone = yearlyAchieved / yearlyTarget; // percentage completed
let procYearRemain = 1 - procYearDone; // percentage remaining
let dataYearProgress = []; // percentage completed, percentage remaining
dataYearProgress.push(procYearDone);
dataYearProgress.push(procYearRemain);


// fill up statistics on yearly stats
// let yD = document.getElementById("year-done");
// yD.innerHTML = "Done: " + yearlyAchieved.toFixed(0) + " km";			
// let yTD = document.getElementById("year-todo");
// yTD.innerHTML = "To do: " + yearlyNeeded.toFixed(0) + " km";	
// let yAvg = document.getElementById("average");
// yAvg.innerHTML = "Average Run: " + avgRunDist.toFixed(1) + " km";	
// let yCount = document.getElementById("count");
// yCount.innerHTML = "Number of Runs: " + numberRuns;	
// let yTime = document.getElementById("total-time");
// yTime.innerHTML = "Total Time: " + totTimeH + ":" 
// 									+ leadingZero(totTimeM) + ":"
// 									+ leadingZero(totTimeS);	
// let yPace = document.getElementById("avg-pace");
// yPace.innerHTML = "Average Pace: " + avgPace;				

// DATA FOR MONTHS
// initiate distance to 0 for all months
let distJan = 0;
let distFeb = 0;
let distMar = 0;
let distApr = 0;
let distMay = 0;
let distJun = 0;
let distJul = 0;
let distAug = 0;
let distSep = 0;
let distOct = 0;
let distNov = 0;
let distDec = 0;

// initiate run count to 0 for all months
let runsJan = 0;
let runsFeb = 0;
let runsMar = 0;
let runsApr = 0;
let runsMay = 0;
let runsJun = 0;
let runsJul = 0;
let runsAug = 0;
let runsSep = 0;
let runsOct = 0;
let runsNov = 0;
let runsDec = 0;

// count km per each month
for (let i = 0; i < arrayRuns.length; i++) { 
	let fullDateRun = new Date(arrayRuns[i]["date"]);
	let monthRun = fullDateRun.getMonth();
	let distRun = Number(arrayRuns[i]["distance"]);

	// decide to which sum to add 
	switch(monthRun) {
		case 0: 
			distJan += distRun;
			runsJan += 1;
			break;
		case 1: 
			distFeb += distRun;
			runsFeb+= 1; 
			break;
		case 2: 
			distMar += distRun; 
			runsMar += 1;
			break;
		case 3: 
			distApr += distRun; 
			runsApr += 1;
			break;
		case 4: 
			distMay += distRun; 
			runsMay += 1;
			break;
		case 5: 
			distJun += distRun; 
			runsJun += 1;
			break;
		case 6: 
			distJul += distRun; 
			runsJul += 1;
			break;
		case 7: 
			distAug += distRun; 
			runsAug += 1;
			break;
		case 8: 
			distSep += distRun; 
			runsSep += 1;
			break;
		case 9: 
			distOct += distRun; 
			runsOct += 1;
			break;
		case 10: 
			distNov += distRun; 
			runsNov += 1;
			break;
		default: 
			distDec += distRun; 
			runsDec += 1;
			break;
	}			
}

// array with monthly distances
let dataMonths = [distJan, distFeb, distMar, distApr, distMay, distJun,
									distJul, distAug, distSep, distOct, distNov, distDec];

// array with monthly number of runs
let runsPerMonth = [runsJan, runsFeb, runsMar, runsApr, runsMay, runsJun,
									runsJul, runsAug, runsSep, runsOct, runsNov, runsDec];

// number of runs current month
let runsCurrMonth = runsPerMonth[dateNow.getMonth()];

// number of weeks each month has
// needed when placing month labels on top of the streak chart
let monthLabels = [0, 4, 8, 13, 17, 22, 26, 30, 35, 39, 43, 48];

// merge the three arrays to prepare new array for D3
// needed in order to display multiple text labels			
let mergedMonths = d3.zip(dataMonths, nameMonths, runsPerMonth, monthLabels);

let distMonthDone = dataMonths[dateNow.getMonth()]; // total distance current month 

let distMonthTarget = (yearlyTarget - (yearlyAchieved - distMonthDone))
											/ (12 - dateNow.getMonth()); // target distance month

let dataMonthProgress = [];		

let distMonthRemain = 0;
let procMonthDone = 0;
let procMonthRemain = 0

// average distance per current month
let avgRunMonth = (distMonthDone / runsCurrMonth).toFixed(1);

// handle percentages over 100%
// when monthly target is exceeded, percentage is capped at 100% 
if (distMonthDone <= distMonthTarget) {
	distMonthRemain = distMonthTarget - distMonthDone;
	procMonthDone = distMonthDone / distMonthTarget;
	procMonthRemain = 1 - procMonthDone;
} 
else {
	distMonthRemain = 0;
	procMonthDone = 1;
	procMonthRemain = 0;
}

dataMonthProgress.push(procMonthDone);
dataMonthProgress.push(procMonthRemain);

// fill up statistics on monthly stats
// let mD = document.getElementById("month-done");
// mD.innerHTML = "Done: " + distMonthDone.toFixed(0) + " km";			
// let mTD = document.getElementById("month-todo");
// mTD.innerHTML = "To do: " + distMonthRemain.toFixed(0) + " km";
// let mAvg = document.getElementById("month-average");
// mAvg.innerHTML = "Average Run: " + avgRunDist.toFixed(1) + " km";	
// let mCount = document.getElementById("month-count");
// mCount.innerHTML = "Number of Runs: " + runsCurrMonth;	

// DATA FOR WEEKS
// initiate distance to 0 for all weeks
let distW1 = 0;
let distW2 = 0;
let distW3 = 0;
let distW4 = 0;
let distW5 = 0;
let distW6 = 0;
let distW7 = 0;
let distW8 = 0;
let distW9 = 0;
let distW10 = 0;
let distW11 = 0;
let distW12 = 0;
let distW13 = 0;
let distW14 = 0;
let distW15 = 0;
let distW16 = 0;
let distW17 = 0;
let distW18 = 0;
let distW19 = 0;
let distW20 = 0;
let distW21 = 0;
let distW22 = 0;
let distW23 = 0;
let distW24 = 0;
let distW25 = 0;
let distW26 = 0;
let distW27 = 0;
let distW28 = 0;
let distW29 = 0;
let distW30 = 0;
let distW31 = 0;
let distW32 = 0;
let distW33 = 0;
let distW34 = 0;
let distW35 = 0;
let distW36 = 0;
let distW37 = 0;
let distW38 = 0;
let distW39 = 0;
let distW40 = 0;
let distW41 = 0;
let distW42 = 0;
let distW43 = 0;
let distW44 = 0;
let distW45 = 0;
let distW46 = 0;
let distW47 = 0;
let distW48 = 0;
let distW49 = 0;
let distW50 = 0;
let distW51 = 0;
let distW52 = 0;
let distW53 = 0;

// count km per each week
for (let i = 0; i < arrayRuns.length; i++) { 
	let fullDateRun = new Date(arrayRuns[i]["date"]);
	let weekRun = getWeekNum(fullDateRun);
	let distRun = Number(arrayRuns[i]["distance"]);

	// decide on which week to sum each run
	switch(weekRun) {
		case 1: distW1 += distRun; break;
		case 2: distW2 += distRun; break;
		case 3: distW3 += distRun; break;
		case 4: distW4 += distRun; break;
		case 5: distW5 += distRun; break;
		case 6: distW6 += distRun; break;
		case 7: distW7 += distRun; break;
		case 8: distW8 += distRun; break;
		case 9: distW9 += distRun; break;
		case 10: distW10 += distRun; break;
		case 11: distW11 += distRun; break;
		case 12: distW12 += distRun; break;
		case 13: distW13 += distRun; break;
		case 14: distW14 += distRun; break;
		case 15: distW15 += distRun; break;
		case 16: distW16 += distRun; break;
		case 17: distW17 += distRun; break;
		case 18: distW18 += distRun; break;
		case 19: distW19 += distRun; break;
		case 20: distW20 += distRun; break;
		case 21: distW21 += distRun; break;
		case 22: distW22 += distRun; break;
		case 23: distW23 += distRun; break;
		case 24: distW24 += distRun; break;
		case 25: distW25 += distRun; break;
		case 26: distW26 += distRun; break;
		case 27: distW27 += distRun; break;
		case 28: distW28 += distRun; break;
		case 29: distW29 += distRun; break;
		case 30: distW30 += distRun; break;
		case 31: distW31 += distRun; break;
		case 32: distW32 += distRun; break;
		case 33: distW33 += distRun; break;
		case 34: distW34 += distRun; break;
		case 35: distW35 += distRun; break;
		case 36: distW36 += distRun; break;
		case 37: distW37 += distRun; break;
		case 38: distW38 += distRun; break;
		case 39: distW39 += distRun; break;
		case 40: distW40 += distRun; break;
		case 41: distW41 += distRun; break;
		case 42: distW42 += distRun; break;
		case 43: distW43 += distRun; break;
		case 44: distW44 += distRun; break;
		case 45: distW45 += distRun; break;
		case 46: distW46 += distRun; break;
		case 47: distW47 += distRun; break;
		case 48: distW48 += distRun; break;
		case 49: distW49 += distRun; break;
		case 50: distW50 += distRun; break;
		case 51: distW51 += distRun; break;
		case 52: distW52 += distRun; break;
		default: distW53 += distRun; break;
	}			
}

// create array for weekly distances
let dataWeeks = [distW1, distW2, distW3, distW4, distW5, distW6, distW7, 
								 distW8, distW9, distW10, distW11, distW12, distW13, distW14, 
								 distW15, distW16, distW17, distW18, distW19, distW20, distW21, 
								 distW22, distW23, distW24, distW25, distW26, distW27, distW28, 
								 distW29, distW30, distW31, distW32, distW33, distW34, distW35, 
								 distW36, distW37, distW38, distW39, distW40, distW41, distW42, 
								 distW43, distW44, distW45, distW46, distW47, distW48, distW49, 
								 distW50, distW51, distW52];	

// create array for week numbers
let nameWeeks = [];
for (let i = 0; i < 52; i++){
	let numberWeek = "W" + (i + 1);
	nameWeeks.push(numberWeek); 
}	

// abbreviations for week days (for day streak chart)
let abbrWeekDays = ["M", "T", "W", "T", "F", "S", "S"];		

// merge the two arrays to prepare new array for D3	
// needed in order to display both values and names
let mergedWeeks = d3.zip(dataWeeks, nameWeeks);			 

let distWeekDone = dataWeeks[getWeekNum(dateNow) - 1]; // distance current week 	
let distWeekTarget = (yearlyTarget - (yearlyAchieved - distWeekDone))
											/ (52 - getWeekNum(dateNow) - 1);
let dataWeekProgress = [];			

let distWeekRemain = 0;
let procWeekDone = 0;
let procWeekRemain = 0

// handle percentages over 100%
// when weekly target is exceeded, weekly percentage is capped at 100% 
if (distWeekDone <= distWeekTarget) {
	distWeekRemain = distWeekTarget - distWeekDone;
	procWeekDone = distWeekDone / distWeekTarget;
	procWeekRemain = 1 - procWeekDone;
} 
else {
	distWeekRemain = 0;
	procWeekDone = 1;
	procWeekRemain = 0;
}

dataWeekProgress.push(procWeekDone);
dataWeekProgress.push(procWeekRemain);

// fill up statistics on weekly stats
// let wD = document.getElementById("week-done");
// wD.innerHTML = "Done: " + distWeekDone.toFixed(0) + " km";			
// let wTD = document.getElementById("week-todo");
// wTD.innerHTML = "To do: " + distWeekRemain.toFixed(0) + " km";

// --------------------DATA FOR DELTA PROGRESS --------------------

// data to generate ideal progress line chart
let allDays = [];
let progressIdeal = [];
let progressIdealFlat = [];

// iterate all days of the year
for (let i = 0; i < 365; i++) {
	allDays.push(i + 1);
	progressIdeal.push(1000/365 * (i+1));
	progressIdealFlat.push(0);
}

// console.log(allDays);
// console.log(progressIdeal);
// console.log(progressIdealFlat);

// data to generate real progress line chart
let runDays = []
let progressReal = [];
let currentDistance = 0;

for (let i = 0; i < arrayDate.length; i++) {
	let dateSum = Date.parse(arrayDate[i]);
	let start = new Date(2021, 0, 0);
	let diff = dateSum - start;
	let oneDay = 1000 * 60 * 60 * 24;
	let dayRun = Math.floor(diff / oneDay);
	runDays.push(dayRun);
}

for (let i = 0; i < arrayDistance.length; i++) {
	currentDistance += Number(arrayDistance[i]);
	progressReal.push(currentDistance);
}

// plot a point representing the current total distance with today's date 
let now = new Date();
let start = new Date(2021, 0, 0);
let diff = now - start;
let oneDay = 1000 * 60 * 60 * 24;
let currentDay = Math.floor(diff / oneDay);
runDays.push(currentDay);

let last = progressReal.length - 1;
let lastElement = progressReal[last];
progressReal.push(lastElement);

// console.log(runDays);
// console.log(progressReal);

let delta;
let progressDelta = [];

for (let i = 0; i < runDays.length; i++) {
	for (let j = 0; j < allDays.length; j++) {
		if(runDays[i] === allDays[j]) {
			delta = progressReal[i] - progressIdeal[j];
			progressDelta.push(delta);
		}
	}
}

// --------------------CHARTS--------------------

function drawCharts(){

	// ----------------MONTHLY DISTANCES - COLUMN CHART------------------

	// empty the container 
	// delete chart to create a new one with a new width
	document.getElementById("month-distances-svg").innerHTML = "";

	// get the new width of the container that will hold the chart
	let newChartWidth1 = document.getElementById("month-distances-svg").clientWidth;

	let wMonChart = newChartWidth1 - 35; // width of svg container for chart 
	let hMonChart = 350; // height of svg container for chart 

	// define x scale
	let xScaleMonth = d3.scaleBand()
					.domain(d3.range(12))
					.rangeRound([0, wMonChart])
					.round(true)
					.paddingInner(0.10);

	// define y scale
	let yScaleMonth = d3.scaleLinear()
					.domain([0, d3.max(dataMonths) + 10]) // +10 to show labels above
					.range([80, hMonChart]);		

	// create SVG element
	let svgMonth = d3.select("#month-distances-svg") // select by id
				.append("svg") // insert the <svg> inside the selected <div>
				.attr("width", wMonChart) // assign width
				.attr("height", hMonChart) // assign height
				.attr("id", "month-distances-chart") // assign id
				// .attr("preserveAspectRatio", "xMinYMin meet") // needed to resize chart with window
				// .attr("viewBox", "0 0 600 350"); // needed to resize chart with window

	// create horizontal line for monthly target
	let lineTarget = d3.axisBottom()
		.scale(xScaleMonth)
		.tickValues([])
		.tickSize(0);		  
	svgMonth.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + (hMonChart - yScaleMonth(83)) + ")")
		.call(lineTarget);

	// create <g> for each month
	let months = svgMonth.selectAll('g.month')
		.data(mergedMonths);
	let monthsEnter = months.enter()
	  .append('g')
	  .classed('month', true);
	// create the <rect> elements
	monthsEnter.append("rect")
	 .attr("x", function(d, i) {
	 		return xScaleMonth(i);
	 })
	 .attr("y", function(d) {
	 		return hMonChart - yScaleMonth(d[0]);
	 })
	 .attr("width", xScaleMonth.bandwidth())
	 .attr("height", function(d) {
	 		return yScaleMonth(d[0]) - 70; // -70 to position labels below chart
	 })
	 // color month columns according to performance
	 .attr("fill", function(d) { 
	 		if (d[0] == 0){
				return "#D1D1D1";
	 		}
	 		else if (d[0] < 80){
	 			return "#09990C"; // changed to using the same color
	 		}
	 		else {
	 			return "#09990C"; // changed to using the same color
	 		}
	 })
	 .attr("stroke", "#000000")
	 .attr("stroke-width", "1px");

	// text labels for monthtly distance
	monthsEnter.append("text")
	 .attr("class", "month-values") // assign a CSS class
	 .text(function(d) {
	 		return d[0].toFixed(0);
	 })
	 .attr("x", function(d, i) {
	 		return xScaleMonth(i) + xScaleMonth.bandwidth() / 2;;
	 })
	 .attr("y", function(d) {
	 		return hMonChart - yScaleMonth(d[0]) - 10;
	 });

	// tooltips
	monthsEnter.append("title")
			.text(function(d, i) {
				return d[0].toFixed(0) + " km " + "\n\n" + d[2] + " runs";
		});
	 
	// text labels for month names
	 monthsEnter.append("text")
	 .attr("class", "month-names") // assign a CSS class
	 .text(function(d) { // retrieve text from array
	 		return d[1];
	 })
		// SVG operation to rotate having (x,y) as origin
	 .attr("transform", function(d,i) { 
		let xText = xScaleMonth(i) + xScaleMonth.bandwidth() / 2 + 4; // x position of text
		let yText = 345; // y position of text
		return "translate(" + xText + ", " + yText + ") rotate(-90)" 
	});


	// ----------------WEEKLY DISTANCES - COLUMN CHART------------------

	// empty the container 
	// delete chart to create a new one with a new width
	document.getElementById("week-distances-svg").innerHTML = "";

	// get the new width of the container that will hold the chart
	let newChartWidth3 = document.getElementById("week-distances").clientWidth;

	let wWeekChart = newChartWidth3; // width of svg container for chart 
	let hWeekChart = 250;	// height of svg container for chart 
	// define x scale
	let xScaleWeek = d3.scaleBand()
					.domain(d3.range(dataWeeks.length))
					.rangeRound([-10, wWeekChart - 20])
					.round(true)
					.paddingInner(0.25);
	// define y scale
	let yScaleWeek = d3.scaleLinear()
					.domain([0, d3.max(dataWeeks) + 10])
					.range([5, hWeekChart]);

	// Create SVG element
	let svgWeek = d3.select("#week-distances-svg") // select by id
				.append("svg") // insert the <svg> inside the selected <div>
				.attr("width", wWeekChart) // assign width
				.attr("height", hWeekChart) // assign height
				.attr("id", "week-distances-chart") // assign id
				// .attr("preserveAspectRatio", "xMinYMin meet") // needed to resize chart with window
				// .attr("viewBox", "0 0 850 250"); // needed to resize chart with window

	// create horizontal line for weekly target
	let lineTargetWeek = d3.axisBottom()
		.scale(xScaleWeek)
		.tickValues([])
		.tickSize(0);		  
	svgWeek.append("g")
		.attr("class", "grid")
		// position line at the 20km/week value
		.attr("transform", "translate(0,"+ (hWeekChart - yScaleWeek(20) - 40) + ")")
		.call(lineTargetWeek);

	// create <g> for each week
	let weeks = svgWeek.selectAll('g.week')
		.data(mergedWeeks);
	let weeksEnter = weeks.enter()
	  .append('g')
	  .classed('week', true);
	// create the <rect> elements
	weeksEnter.append("rect")
	   .attr("x", function(d, i) {
	   		return xScaleWeek(i);
	   })
	   .attr("y", function(d) {
	   		return hWeekChart - yScaleWeek(d[0]) - 40;
	   })
	   .attr("width", xScaleWeek.bandwidth())
	   .attr("height", function(d) {
	   		return (yScaleWeek(d[0]) ); // -40 to position labels below chart
	   })
	   // color week columns according to performance
	   .attr("fill", function(d) { 
	 		if (d[0] == 0){
				return "#D1D1D1";
	 		}
	 		else if (d[0] < 19){
	 			return "#09990C";
	 		}
	 		else {
	 			return "#09990C";
	 		}
	 })
	 .attr("stroke", "#000000")
	 .attr("stroke-width", "1px");

	// text labels for weekly distance
	weeksEnter.append("text")
	 .attr("class", "week-values") // assign a CSS class
	 .text(function(d) {
	 		return d[0].toFixed(0);
	 })
	 .attr("text-anchor", "middle")
	 .attr("x", function(d, i) {
	 		return xScaleWeek(i) + xScaleWeek.bandwidth() / 2;
	 })
	 .attr("y", function(d) {
	 		return hWeekChart - yScaleWeek(d[0]) - 45;
	 });

	// tooltips
	weeksEnter.append("title")
			.text(function(d, i) {
				return d[0].toFixed(0) + " km";
		});

	// text labels for week names
	weeksEnter.append("text")
	 .attr("class", "week-names") // assign a CSS class
	 .text(function(d) { // retrieve text from array
	 		return d[1];
	 })
		// SVG operation to rotate having (x,y) as origin
	 .attr("transform", function(d,i) { 
		let xText = xScaleWeek(i) + xScaleWeek.bandwidth() / 2 + 4; // x position of text
		let yText = 240; // y position of text
		return "translate(" + xText + ", " + yText + ") rotate(-90)" 
	});
	
	// -----------------LINE CHART - OVERALL PROGRESS// -----------------

	// empty the container 
	// delete chart to create a new one with a new width
	document.getElementById("delta-progress-svg").innerHTML = "";

	// get the new width of the container that will hold the chart
	let newChartWidth2 = document.getElementById("delta-progress").clientWidth;

	let widthProgr = newChartWidth2;
	let heightProgr = 136; // instead of 150 as the SVG is created after the CSS with border-box
	let axisOffset = 25;

	let dataIdeal = d3.zip(allDays, progressIdealFlat);
	let dataReal = d3.zip(runDays, progressDelta);

	let xScaleNew = d3.scaleLinear()
				.domain([d3.min(allDays), d3.max(runDays)])
				.range([axisOffset, widthProgr]);

	let yScaleNew = d3.scaleLinear()
			.domain([-50, 50])
			.range([heightProgr, 0]);

	// no x axis is needed for this line chart

	// define Y axis
	let yAxis = d3.axisLeft()
			.scale(yScaleNew)
			.ticks(4);
			// .outerTickSize(0);

	// define line generator
	let line = d3.line()
			.x(function(d) { return xScaleNew(d[0]); })
			.y(function(d) { return yScaleNew(d[1]); });

	let area1 = d3.area()
			.defined(function(d) { return yScaleNew(d[1]); })
			.x(function(d) { return xScaleNew(d[0]); })
			.y0(function() { return yScaleNew.range()[0]/2; })
			.y1(function(d) { return yScaleNew(d[1]); });

	// create the SVG element
	var svgLineChart = d3.select("#delta-progress-svg")
			.append("svg")
			.attr("width", widthProgr)
			.attr("height", heightProgr)
			.attr("id", "delta-progress-chart");
			// .attr("preserveAspectRatio", "xMinYMin meet") // needed to resize chart with window
			// .attr("viewBox", "0 0 600 200"); // needed to resize chart with window

	// create the two lines
	svgLineChart.append("path")
			.datum(dataIdeal)
			.attr("id", "line-ideal")
			.attr("d", line);

	svgLineChart.append("path")
			.datum(dataReal)
			.attr("id", "line-real")
			.attr("d", line);	

	svgLineChart.append("path")
			.datum(dataReal)
			.attr("class", "area")
			.attr("d", area1);			

	// create y axis
	svgLineChart.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + axisOffset + ",0)")
		.call(yAxis);	

  // -----------------CALENDAR VIEW-----------------

	// empty the container 
	// delete chart to create a new one with a new width
	document.getElementById("daily-streak-svg").innerHTML = "";

	// get the new width of the container that will hold the chart
	let streakChartW = document.getElementById("daily-streak-svg").clientWidth;
	// set cell size to be proportional to chart size in order to scale
	let cellSize = (streakChartW - 55) / 53; // cell size
	// set the height of the chart to be proportional to the cell size (and width of container)
	let streakChartH = (cellSize * 7) + 50; // height of SVG container


	// let wDayChart = 1178; // with of SVG container

	let format = d3.timeFormat("%Y-%m-%d");

	// associate two color classes to the values 0 and 1
	let color = d3.scaleQuantize()
	  .domain([0, 1])
	  .range(d3.range(2).map(function(d) { return "q" + d; })); 

	let svgDay = d3.select("#daily-streak-svg").selectAll("daily-streak-svg")
	  .data(d3.range(2021, 2022)) // returns 2021
		.enter().append("svg")
	  .attr("width", streakChartW)
	  .attr("height", streakChartH)
	  .attr("class", "day-status")
	  .attr("id", "daily-streak-chart")
		.append("g")
	  .attr("transform", "translate(20, 30)");

	  // console.log(d3.timeDays(new Date(2021, 0, 1), new Date(2021 + 1, 0, 1)));

	// make Monday first day of week
	// initially Sunday = 0, Monday = 1, ..., Saturday = 6
	// after Sunday = 6, Monday = 0, ..., Saturday = 5
	function mondayFirst(x) {
		switch(x) {
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
	let rect = svgDay.selectAll(".day")
	  .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); }) // return all the dates in between two given dates
		.enter().append("rect")
	  .attr("class", "day")
	  .attr("width", cellSize) // width of cell
	  .attr("height", cellSize) // height of cell
	  // x coord of each cell
	  .attr("x", function(d) { 
	  	// if day is Sunday, shift those cells to the left to fix 
	  	if (d.getDay() === 0) {
	  		return (d3.timeWeek.count(d3.timeYear(d), d)) * cellSize - cellSize; 
	  	}
	  	// else (days are not Sundays), print as usual
	  	else {
	  		return (d3.timeWeek.count(d3.timeYear(d), d)) * cellSize
	  	}
	  }) 
	  // y coordinates of each cell
	  .attr("y", function(d) { return mondayFirst(d.getDay()) * cellSize; }) 
	  // getDay() method returns the day of the week (Sunday 0, Monday 1)
	  // apply mondayFirst() function to shift cells correctly
	  .datum(format);


	// place day of month inside the cell
	let dayNumber = svgDay.selectAll("g.month-day-streak")
	  .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); }) // return all the dates in between two given dates
		.enter()
		.append("text")
		.text(function(d) {
			return String(d).split(" ")[2];
			// split the full date into an array at empty space (" ")
			// output the third element of the array (the day of month)
		})
		.attr("class", "month-day-streak")
	  .attr("text-anchor", "middle")
	  .attr("x", function(d) { 
	  	// if day is Sunday, shift those labels to the left to fix 
	  	if (d.getDay() === 0) {
	  		return (d3.timeWeek.count(d3.timeYear(d), d))	* cellSize + cellSize / 2 - cellSize; 
	  	}
	  	// else (days are not Sundays), print as usual
	  	else {
	  		return (d3.timeWeek.count(d3.timeYear(d), d))	* cellSize + cellSize / 2;
	  	}
	  })
	  // y coordinates of the day number text
	  .attr("y", function(d) { 
	  	// console.log(typeof(d.getDay()));
	  	return mondayFirst(d.getDay()) * cellSize + cellSize / 2 + 3; });

	// place names of months above chart
	svgDay.selectAll("g.month-name-streak")
		.data(mergedMonths)
		.enter()
		.append("text")
		.text(function(d) {
			return d[1];
		})
		.attr("class", "month-name-streak")
	  .attr("text-anchor", "middle")
	  .attr("x", function(d, i) {
	  	return cellSize * (3 + d[3]); // align month names to cells
	  })
	  .attr("y", "-10");

	// place day of week to the left of the chart
	svgDay.selectAll("g.week-day")
		.data(abbrWeekDays)
		.enter()
		.append("text")
		.text(function(d) {
			return d;
		})
		.attr("class", "week-day")
	  .attr("text-anchor", "middle")
	  .attr("x", "-15")
	  .attr("y", function(d, i) {
	  	return 15 + i * cellSize;
	  });

	// create the tooltips with date of cell
	rect.append("title")
	  .text(function(d) { return d; })

	// color the cells according to rules (if you ran that day)
	// 2021-05-04: separate external file with daily run status no longer needed 
	rect.attr("class", function(d) { 
		if (arrayRuns.find(x => x.date === d)) {
		  return "day q1"
		}
		else {
		  return "day q0"
		} 
	});	


	// create the month thicker delimitations
	// d3.timeMonths(start, end) returns all dates in the given range of start, end
	svgDay.selectAll(".month-group")
	  .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		.enter().append("path")
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
		function fixW0(){
			if (oldW0 === 31) {
				w0 = oldW0 - 1; 
			}
			else {
				w0 = oldW0;
			}
			return w0;
		}
		fixW0();


		function fixW1(){
			if ((oldW1 === 5 ) || (oldW1 === 9) || (oldW1 === 44) ) {
				w1 = oldW1 - 1; 
			}
			else {
				w1 = oldW1;
			}
			return w1;
		}
		fixW1();

		return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
		    + "H" + w0 * cellSize + "V" + 7 * cellSize
		    + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
		    + "H" + (w1 + 1) * cellSize + "V" + 0
		    + "H" + (w0 + 1) * cellSize + "Z";
	}

}


// --------------------PROGRESS DONUT CHARTS--------------------
let wDonChart = 150; // width of SVG for donut charts
let hDonChart = 150; // height of SVG for donut charts
let xPercent = wDonChart / 2;
let yPercent = hDonChart / 2; 
let outerRadius = wDonChart / 2.2; // outer radius of donut
let innerRadius = wDonChart / 3.5; // inner radius of donut

// YEARLY PROGRESS DONUT CHART
let arcY = d3.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);
let pieY = d3.pie();

// create SVG element
let svgY = d3.select("#yearly-progress-svg") // select by id
		.append("svg") // insert the <svg> inside the selected <div>
		// .attr("width", wDonChart) // width of SVG container
		// .attr("height", hDonChart) // height of SVG container
		.attr("id", "yearly-chart") 
		.attr("preserveAspectRatio", "xMinYMin meet") // needed to resize chart with window
		.attr("viewBox", "0 0 150 150"); // needed to resize chart with window

// set up groups
let arcsY = svgY.selectAll("g.arc")
	  .data(pieY(dataYearProgress))
	  .enter()
	  .append("g") // create each group
	  .attr("class", "arc")
	  .attr("transform", "translate(" + wDonChart/2 + "," + hDonChart/2 + ")");

// draw arc paths
arcsY.append("path")
    // color percentages
    .attr("fill", function(d, i) {
    	if (i == 0){
    		return "#09990C";
    	}
    	else {
    		return "#D1D1D1";
    	}			    	   	
    })
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px")
    .attr("d", arcY)
	  .append("title")
			.text(function(d, i) {
				return (dataYearProgress[i] * 1000).toFixed(1) + " km";
		});

// label for percentage completed (middle of donut)
svgY.append("text")
		.attr("class", "percentage")
		.attr("x", xPercent)
		.attr("y", yPercent + 10)
    .text(((procYearDone * 100)).toFixed(0) + " %");
// -------------------------------------------------------------------------------	

// MONTHLY PROGRESS DONUT CHART
let arcM = d3.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);
let pieM = d3.pie();

// create SVG element
let svgM = d3.select("#monthly-progress-svg") // select by id
		.append("svg") // insert the <svg> inside the selected <div>
		// .attr("width", wDonChart) // width of SVG container
		// .attr("height", hDonChart) // height of SVG container
		.attr("id", "yearly-chart") 
		.attr("preserveAspectRatio", "xMinYMin meet") // needed to resize chart with window
		.attr("viewBox", "0 0 150 150"); // needed to resize chart with window	

// set up groups
var arcsM = svgM.selectAll("g.arc")
	  .data(pieM(dataMonthProgress))
	  .enter()
	  .append("g") // create each group
	  .attr("class", "arc")
	  .attr("transform", "translate(" + wDonChart/2 + "," + hDonChart/2 + ")");

// draw arc paths
arcsM.append("path")
    // color percentages
    .attr("fill", function(d, i) {
    	if (i == 0){
    		return "#09990C";
    	}
    	else {
    		return "#D1D1D1";
    	}			    	   	
    })
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px")
    .attr("d", arcM)
	  .append("title")
			.text(function(d, i) {
				return (dataMonthProgress[i] * distMonthTarget).toFixed(1) + " km";
		});

// label for percentage completed (middle of donut)
svgM.append("text")
		.attr("class", "percentage")
		.attr("x", xPercent)
		.attr("y", yPercent + 10)
    .text(((procMonthDone * 100)).toFixed(0) + " %");
// -------------------------------------------------------------------------------	


// WEEKLY PROGRESS DONUT CHART
let arcD = d3.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);
let pieD = d3.pie();

// create SVG element
let svgD = d3.select("#weekly-progress-svg") // select by id
		.append("svg") // insert the <svg> inside the selected <div>
		// .attr("width", wDonChart) // width of SVG container
		// .attr("height", hDonChart) // height of SVG container
		.attr("id", "yearly-chart")
		.attr("preserveAspectRatio", "xMinYMin meet") // needed to resize chart with window
		.attr("viewBox", "0 0 150 150"); // needed to resize chart with window

// set up groups
var arcsD = svgD.selectAll("g.arc")
	  .data(pieD(dataWeekProgress))
	  .enter()
	  .append("g") // create each group
	  .attr("class", "arc")
	  .attr("transform", "translate(" + wDonChart/2 + "," + hDonChart/2 + ")");

// draw arc paths
arcsD.append("path")
    // color percentages
    .attr("fill", function(d, i) {
    	if (i == 0){
    		return "#09990C";
    	}
    	else {
    		return "#D1D1D1";
    	}			    	   	
    })
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px")
    .attr("d", arcD)
	  .append("title")
			.text(function(d, i) {
				return (dataWeekProgress[i] * distWeekTarget).toFixed(1) + " km";
		});

// label for percentage completed (middle of donut)
svgD.append("text")
		.attr("class", "percentage")
		.attr("x", xPercent)
		.attr("y", yPercent + 10)
    .text(((procWeekDone * 100)).toFixed(0) + " %");
// -------------------------------------------------------------------------------						



// -------------------------------------------------------------------------------

// TABLE WITH RUNS
let divNewTable = document.getElementById("table-data"); // table container 
document.getElementById("table-data").style.height = "auto";
const tableHeaders = ["Run ID", "Run Date (yyyy&#8209;mm&#8209;dd)", "Distance (km)",
 "Duration (hh:mm:ss)", "Speed (km/h)", "Pace (min/km)"];
 // dash added like that to avoid splitting at "-" when wrapping

let tableRuns = document.createElement("table") // create table element
tableRuns.id = "table-runs"; // assign id to table
let tr = tableRuns.insertRow(-1); // insert the first row
  
for (let i = 0; i < tableHeaders.length; i++){
  let th = document.createElement("th"); // create the table headers       
  tr.appendChild(th); // assign the headers in the first table row
  // th.innerHTML = tableHeaders[i];
  switch(i) {
  	case 1: th.outerHTML = "<th onclick=" + "sortTableDate(" + i + ") title='Click to Sort'>" + tableHeaders[i] + "</th>"; break;
  	case 5: th.outerHTML = "<th onclick=" + "sortTablePace(" + i + ") title='Click to Sort'>" + tableHeaders[i] + "</th>"; break;
  	default: th.outerHTML = "<th onclick=" + "sortTableNumber(" + i + ") title='Click to Sort'>" + tableHeaders[i] + "</th>"; break;
  }       
}; 

// use max to avoid empty fields
let maxSize = Math.max(arrayId.length, arrayDate.length, 
	arrayDistance.length, arraySpeed.length, arrayDuration.length);

// populate each row with data
// iterate in this odd way to show the most recent run first
for (let i = maxSize - 1; i >= 0; i--) {
  tr = tableRuns.insertRow(-1); // add table row              
  let cell1 = tr.insertCell(-1); // create cell
  cell1.innerHTML = arrayId[i]; // add id to cell
  let cell2 = tr.insertCell(-1); // create cell
  cell2.innerHTML = arrayDate[i]; // add date to cell
  let cell3 = tr.insertCell(-1); // create cell
  cell3.innerHTML = arrayDistance[i]; // add distance to cell
  let cell4 = tr.insertCell(-1); // create cell
  cell4.innerHTML = arrayDuration[i]; // add duration to cell
  let cell5 = tr.insertCell(-1); // create cell
  cell5.innerHTML = arraySpeed[i]; // add speed to cell
  let cell6 = tr.insertCell(-1); // create cell
  cell6.innerHTML = arrayPace[i]; // add pace to cell        
}

divNewTable.innerHTML = ""; // empty the table before calling update
divNewTable.appendChild(tableRuns); // write the table

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

    for (i = 1; i < (rows.length - 1); i++) {
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
      switchcount ++;      
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

    for (i = 1; i < (rows.length - 1); i++) {
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
      switchcount ++;      
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

    for (i = 1; i < (rows.length - 1); i++) {
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
      switchcount ++;      
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}		

// -------------------------------------------------------------------------------

// draw the chart for the first time when map is initiated
drawCharts();

// when the window is resized the chart is redrawn to strecth the bars to fill the space
window.addEventListener('resize', drawCharts);






