Math.randomInt = (min, max = null) => {
	if (max == null) { max = min; min = 0;}
	return Math.floor(Math.random() * (max - min) + min);
}

Math.distance = (x1, y1, x2, y2) => {
	return Math.abs(x1-x2) + Math.abs(y1-y2);
}

Math.normalize = (val, min, max) => {
	return (val - min) / (max - min);
}

Math.compare = (a, b) => {
	return a < b ? -1 : b < a ? 1 : 0;
}

Math.intersects = (a, b) => {
	return a.x1 < b.x2 && a.x2 > b.x1 &&
	       a.y1 < b.y2 && a.y2 > b.y1;
}