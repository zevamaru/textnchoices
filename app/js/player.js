class TextsNChoices {
	app;
	story;
	text;

	constructor(el) {
		this.app = document.querySelector(el);
	}

	async loadStory(file_name) {
		const response = await fetch('data/stories/' + file_name + '.json');
		this.story = await response.json();
		this.#play();
	}

	addText(id) {
		this.text = this.story.texts.find((text) => text.id == id);
		let choices = ``;
		for (var $i = 0; $i < this.text.choices.length; $i++) {
			let li_id = id + '-choise-' + ($i + 1);
			choices += `
        <li id="${li_id}" data-link-to="${this.text.choices[$i]['link-to']}">
          &#62; ${this.text.choices[$i]['content']}
        </li>
        `;
		}
		let text = `
    <div class="text" id="${this.text.id}">
      <div class="content">
        ${this.text.content}
      </div>
      <ul>
        ${choices}
      </ul>
    </div>`;
		this.app.innerHTML += text;

		let texts = document.getElementsByClassName('text');
		for (var i = 0; i < texts.length; i++) {
			texts[i].classList.remove('load-animation');
		}
		let el = document.getElementById(id);
		el.classList.add('load-animation');

		const choose = function (e) {
			if (e.target.matches('[data-link-to]')) {
				e.preventDefault();
				history.pushState('', '', e.target.href);
				router();

				let choices = e.target.parentElement.getElementsByTagName('li');
				for (var i = 0; i < choices.length; i++) {
					if (choices[i] !== e.target) {
						choices[i].style.display = 'none';
					} else {
						choices[i].classList.add('selected');
						let choosed = document.getElementsByClassName('choose-animation');
						for (var i = 0; i < choosed.length; i++) {
							choosed[i].classList.remove('choose-animation');
						}
						choices[i].classList.add('choose-animation');
					}
				}
				setTimeout(() => {
					app.scrollTo(e.target.getAttribute('id'));
				}, 200);
				app.addText(e.target.dataset.linkTo);
				this.removeEventListener('click', choose);
			}
		};

		window.addEventListener('click', choose);
	}

	scrollTo(id) {
		let el = document.getElementById(id);
		scroll({
			top: el.offsetTop - 40,
			behavior: 'smooth',
		});
	}

	#play() {
		this.addText('start');
	}
}

const app = new TextsNChoices('#app');
app.loadStory('story_name');

const routes = {
	'/': {
		title: 'Home',
		render: function () {
			return '<h1>About</h1>';
		},
	},
};

function router() {
	let view = routes[location.pathname];

	if (view) {
		document.title = view.title;
		//app.innerHTML = view.render();
	} else {
		history.replaceState('', '', '/');
		router();
	}
}

// Update router
window.addEventListener('popstate', router);
window.addEventListener('DOMContentLoaded', router);
