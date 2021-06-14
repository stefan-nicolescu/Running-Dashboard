# Running Dashboard

### Motto
*If you want to improve it, you have to measure it first!*
Break down a chunky goal into small manageable steps that are not daunting to make. Be consistent!

### Description and Usage
Set a yearly running goal. Add runs as you perform them throughout the year. The yearly goal is divided into monthly and weekly goals. The concept is simple - meet weekly goals to meet monthly goals to meet yearly goals.

The Pie Charts express in percentages target completion (for current year, current month, and current week).The Area Chart shows whether you are below or above the target (the higher the crests, the more you are above target). The Column Charts express how each month and week was against the average needed to achieve the yearly goal (dotted lines). The Calendar View marks days when you ran. This makes it easy to have a quick overview on past performance and have a sense of your consistency.

The dashboard is responsive and charts are scaled and re-positioned according to screen width. The table displays the information about all runs and can be sorted by clicking on table headers.

### Technical Details
The charts were created using D3.js JavaScript library. No other library was used.

Responsiveness was achieved using CSS Grid.

### Limitations
+ information about each run is currently stored as JavaScript objects, so it is not very convenient to update;
+ there is no menu yet to set a yearly target of kilometers, now controlled through JavaScript variables;
+ the monthly and weekly targets are fixed (1000/12 and 1000/52);
+ some charts do not make use of all available space when viewed on small screens;

### To Do
+ read run data from a CSV/database;
+ add menu to input yearly target;
+ update monthly and weekly targets as you progress (increase or decrease the target depending on previous runs);
+ rename some variables to achieve more consistency;

### Sources and Inspiration
+ calendar view: https://observablehq.com/@d3/calendar-view

### License
_Under Construction_
