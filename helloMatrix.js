function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const colour_array = ['#7FFF00', '#00FF00', '#008000', '#000000'];

const rgb_array = colour_array.map((i) => {
	return [
		parseInt(i.substring(1, 3), 16),
		parseInt(i.substring(3, 5), 16),
		parseInt(i.substring(5, 7), 16)
	];
});


const char_set = ['E', 'H', 'L', 'O', ' ', ' ', ' '];

async function something(id) {
	let current_try = '     ';

	while (current_try != 'HELLO') {		
		let delay = Math.floor(Math.random() * 20) * 5 + 25;

		for (let i = 0; i < 5; i++) {
			let curr_to_str = current_try.split('');
			curr_to_str[i] = char_set[Math.floor(Math.random() * char_set.length)];
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

	document.getElementById(id).style.color = 'red';
	document.getElementById(id).parentElement.classList.remove('mirrored'); // remove mirroring when it's red
}

function rgb_to_hex(val) { // not really
	return val.substring(4, val.length - 1).replace(/\s/g, '').split(',').map((i) => Number(i));
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

async function colour_change(id) {

	if (document.getElementById(id).style.color == '') {
		document.getElementById(id).style.color = '#00FF00';
	}

	while (document.getElementById(id).style.color != 'red') {
		let current_col = rgb_to_hex(document.getElementById(id).style.color);
		let chosen_col;

		do {
			chosen_col = rgb_array[Math.floor(Math.random() * rgb_array.length)];		
		} while (chosen_col == current_col);
		 
		let step = 20;
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

			if (document.getElementById(id).style.color == 'red') {
				break;
			}

			document.getElementById(id).style.color = rgbToHex(current_col[0], current_col[1], current_col[2]);
			await sleep(10);
		}

	}

}

function blank_col(id){
	document.getElementById(id).innerHTML = '     ';
	document.getElementById(id).style.color = '#000000';
}

let nums = 90;
let cols = 12;
let main = '<table>';

for (let i = 0; i < nums; i++) {
	main += '<tr>';

	for (let j = 0; j < cols; j++) {
		main += `<td><span id='d${i}-${j}'></span></td>`;
	}

	main += '</tr>';
}

main += '</table>';
document.getElementById('main').innerHTML = main;

async function do_it(nums, cols) {

	let alive_funcs = [];

	
	for (let j = 0; j < cols; j++) {

		for (let i = 0; i < nums; i++) {
			//5-65

			if(Math.random() * 100 > (((j+1) * 7) - 2)){
				alive_funcs.push(something(`d${i}-${j}`));
				alive_funcs.push(colour_change(`d${i}-${j}`));
			}else{
				blank_col(`d${i}-${j}`);
			}
			
		}
	}
	await Promise.all(alive_funcs);
}

do_it(nums, cols);
