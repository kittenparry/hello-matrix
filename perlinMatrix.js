const colour_array = ['#7FFF00', '#00FF00', '#008000', '#000000'];

const rgb_array = colour_array.map((i) => {
	return [
		parseInt(i.substring(1, 3), 16),
		parseInt(i.substring(3, 5), 16),
		parseInt(i.substring(5, 7), 16)
	];
});

const num_tbl_rows = 45;
const num_tbl_cols = 45;
const search_query = 'X';

let charset = ['E', 'H', 'L', 'O', ' ', ' ', ' '];

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function rgbParser(val) { // not really
	return val.substring(4, val.length - 1).replace(/\s/g, '').split(',').map((i) => Number(i));
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function blank_col(id){
	document.getElementById(id).innerHTML = '     ';
	document.getElementById(id).style.color = '#000000';
}

function create_table(rows, cols) {
	let main = '<table>';
	for (let i = 0; i < rows; i++) {
		main += '<tr>';
		for (let j = 0; j < cols; j++) {
			main += `<td><span id='d${i}-${j}'></span></td>`;
		}
		main += '</tr>';
	}
	main += '</table>';
	document.getElementById('main').innerHTML = main;	
}

function init_charset(query) {
	let uniq = "";
	for(let i = 0; i < query.length; i++){
		if(uniq.includes(query[i]) === false){
			uniq += query[i];
		}
	}
	charset = uniq.split('');
}

function init(rows, cols, query) {
	create_table(rows, cols);
	init_charset(query);
}

async function reroll_process(id, query) {
	let current_try = '';
	for(let i = 0; i < query.length; i++) {
		current_try += ' ';
	}
	document.getElementById(id).innerHTML = 'X';
	/*
	while (true) {
		let delay = Math.floor(Math.random() * 20) * 5 + 25;
		for (let i = 0; i < query.length; i++) {
			let curr_to_str = current_try.split('');
			curr_to_str[i] = charset[Math.floor(Math.random() * charset.length)];
			current_try = curr_to_str.join('');
			document.getElementById(id).innerHTML = current_try;
			await sleep(delay/5);
		}
		if (Math.random() * 100 < 50) {
			document.getElementById(id).parentElement.classList.add('mirrored');
		} else {
			document.getElementById(id).parentElement.classList.remove('mirrored');
		}
	}
	*/
}

function get_random_rgb() {
	let random_rgb = [0, 0, 0];
	for(let i = 0; i < 3; i++) {
		random_rgb[i] = Math.floor(Math.random() * 255);
	}
	return random_rgb;
}

function get_color(i, j) {
	return rgbParser(document.getElementById(`d${i}-${j}`).style.color);
}

function add_color(arg0, arg1) {
	return [
		arg0[0] + arg1[0],
		arg0[1] + arg1[1],
		arg0[2] + arg1[2],
	];
}

function dec2bin(dec) {
	return (dec >>> 0).toString(2);
}

function noise(nodes) {
	let grid = [];
	for (let i = 0; i < nodes; i++) {
		let row = [];
		for (let j = 0; j < nodes; j++) {
			row.push(random_unit_vector());
		}
		grid.push(row);
	}
	return grid;
}

gradients = {};
memory = {};

function dot_prod_grid(x, y, v_x, v_y) {
	let g_vect;
	if(gradients[[v_x, v_y]]) {
		g_vect = gradients[[v_x, v_y]];
	}
	else {
		g_vect = random_unit_vector();
		gradients[[v_x, v_y]] = g_vect;
	}
	let d_vect = {
		x: x - v_x,
		y: y - v_y
	};
	let res = d_vect.x * g_vect.x + d_vect.y * g_vect.y;
	return res;
}

function stepper(x) {
	return 6*x**5 - 15*x**4 + 10*x**3;
}

function interpolate(weight, a, b) {
	return a + (b - a) * stepper(weight);
}

function perlin_noise(x, y) {
	if(memory.hasOwnProperty([[x,y]])) {
		return memory[[x, y]];
	}
	let x0 = Math.floor(x);
	let x1 = x0 + 1;
	let y0 = Math.floor(y);
	let y1 = y0 + 1;
	let n0 = dot_prod_grid(x, y, x0, y0);
	let n1 = dot_prod_grid(x, y, x1, y0);
	let n2 = dot_prod_grid(x, y, x0, y1);
	let n3 = dot_prod_grid(x, y, x1, y1);
	let r0 = interpolate(x - x0, n0, n1);
	let r1 = interpolate(x - x0, n2, n3);
	let intensity = interpolate(y - y0, r0, r1)
	memory[[x, y]] = intensity;
	return intensity;
}

function random_unit_vector() {
	let theta = Math.random() * 2 * Math.PI;
	return {
		x: Math.cos(theta),
		y: Math.sin(theta)
	};
}

function draw_rect(i, j, rows, cols) {
	let c = document.getElementById("mainCanvas");
	let ctx = c.getContext("2d");
	let width_x = c.width / cols;
	let width_y = c.height / rows;
	let start_x = i * width_y;
	let start_y = j * width_x;
	let color = brightness_randomize(i, j, [255, 255, 255]);
	ctx.fillStyle = rgbToHex(color[0], color[1], color[2]);
	ctx.fillRect(start_x, start_y, start_x + width_x, start_y + width_y);
}

function visualise_noise() {
	let c = document.getElementById("mainCanvas");
	let ctx = c.getContext("2d");
	for(let i = 0; i < num_tbl_rows; i++) {
		for(let j = 0; j < num_tbl_cols; j++) {
			draw_rect(i, j, num_tbl_rows, num_tbl_cols);
		}
	}
	console.log("done");
}

let rand0 = Math.floor(Math.random()*5 + 5);
let rand1 = Math.floor(Math.random()*10 + 85);

function brightness_randomize(i, j, color) {
	let noise = perlin_noise(i / rand0, j / rand1);
	let randomized = [0, 0, 0];
	for(let i = 0; i < randomized.length; i++) {
		randomized[i] = Math.min(255, (0.5 + noise) * color[i]);
		randomized[i] = Math.max(0, randomized[i]);
		randomized[i] = parseInt(randomized[i]);
	}
	return randomized;
}

function absorb_all(i, j, rows, cols) {
	let neighbour_avg = [0, 0, 0];
	let neighbour_cnt = 0;
	let cur_neighbour_color;
	if(i > 0) {
		cur_neighbour_color = get_color(i-1, j);
		neighbour_avg = add_color(neighbour_avg, cur_neighbour_color);
		neighbour_cnt++;
	}
	if(i < rows-1) {
		cur_neighbour_color = get_color(i+1, j);
		neighbour_avg = add_color(neighbour_avg, cur_neighbour_color);
		neighbour_cnt++;
	}
	if(j > 0) {
		cur_neighbour_color = get_color(i, j-1);
		neighbour_avg = add_color(neighbour_avg, cur_neighbour_color);
		neighbour_cnt++;
	}
	if(j < cols-1) {
		cur_neighbour_color = get_color(i, j+1);
		neighbour_avg = add_color(neighbour_avg, cur_neighbour_color);
		neighbour_cnt++;
	}
	for(let i = 0; i < neighbour_avg.length; i++) {
		neighbour_avg[i] /= neighbour_cnt;
	}
	return brightness_randomize(i, j, neighbour_avg);
}

function absorb_left(i, j, rows, cols) {
	let neighbour_avg = [0, 0, 0];
	let cur_neighbour_color;
	if(i > 0) {
		cur_neighbour_color = get_color(i-1, j);
		neighbour_avg = add_color(neighbour_avg, cur_neighbour_color);
	}
	return neighbour_avg;
}

async function colour_change(i, j, color_func) {
	let id = `d${i}-${j}`;
	if (document.getElementById(id).style.color == '') {
		document.getElementById(id).style.color = '#000000';
	}
	let lighthouse = false;
	if(Math.random() < 1) {
		document.getElementById(id).style.color = '#FFFFFF';
		lighthouse = true;
	}
	while (lighthouse) {
		let current_col = rgbParser(document.getElementById(id).style.color);
		let chosen_col = brightness_randomize(i, j, [255, 255, 255]);
		let stay_longer = false;
		let step = 10;
		let sleep_duration = 200;
		let step_duration = Math.floor(sleep_duration / step);
		let long_duration = 10000;
		let diff = [
			parseInt((chosen_col[0] - current_col[0]) / step),
			parseInt((chosen_col[1] - current_col[1]) / step),
			parseInt((chosen_col[2] - current_col[2]) / step)
		];
		for (let i = 0; i < step; i++) {
			current_col[0] += diff[0];
			current_col[1] += diff[1];
			current_col[2] += diff[2];
			let val = rgbToHex(current_col[0], current_col[1], current_col[2]);
			document.getElementById(id).style.color = val;
			await sleep(step_duration);
		}
		if(stay_longer) {
			await sleep(long_duration);
		}
	}
}

async function do_it(nums, cols, query) {
	let alive_funcs = [];
	for (let j = 0; j < cols; j++) {
		for (let i = 0; i < nums; i++) {
			if(Math.random() * 100 > (((j+1) * 7) - 2)){
				alive_funcs.push(reroll_process(`d${i}-${j}`, query));
				alive_funcs.push(colour_change(i, j, absorb_left));
			}else{
				blank_col(`d${i}-${j}`);
			}
		}
	}
	await Promise.all(alive_funcs);
}

async function randomizer() {
	while(true) {
		rand0 = Math.floor(Math.random()*num_tbl_rows + 1);
		rand1 = Math.floor(Math.random()*num_tbl_cols + 20);
		visualise_noise();
		await sleep(1500);
	}
}

async function do_it_properly(nums, cols, query) {
	let alive_funcs = [];
	for (let j = 0; j < cols; j++) {
		for (let i = 0; i < nums; i++) {
			alive_funcs.push(reroll_process(`d${i}-${j}`, query));
			alive_funcs.push(colour_change(i, j, absorb_all));
		}
	}
	await Promise.all(alive_funcs);
}

init(num_tbl_rows, num_tbl_cols, search_query);
do_it_properly(num_tbl_rows, num_tbl_cols, search_query);
visualise_noise();
randomizer();
