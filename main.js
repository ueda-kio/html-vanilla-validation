(() => {
	class Validate {
		/** @type {HTMLFormElement} */
		#form;
		/** @type {Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} */
		#formElms;
		/** @type {Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} */
		#customRuleFormElms;

		/** @param {HTMLFormElement} form */
		constructor(form) {
			this.#form = form;
			this.#formElms = [...this.#form.elements].filter(
				(elm) => elm instanceof HTMLInputElement || elm instanceof HTMLSelectElement || elm instanceof HTMLTextAreaElement
			);
			this.#customRuleFormElms = this.#formElms.filter((elm) => elm.matches('[data-custom-rule="test"]'));
		}

		/**
		 * @summary `#getElms`メソッドの返り値の型を定義
		 * @typedef {Object} ReturnElms
		 * @property {Element} wrapper - 入力項目ラッパー要素
		 * @property {Element} errorMessage - エラーメッセージ要素
		 */
		/**
		 * 引数から受け取った入力項目に関連する要素を取得する
		 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input 入力項目
		 * @returns {ReturnElms}
		 */
		#getElms(input) {
			const wrapper = input.closest('[data-wrapper]');
			const errorMessage = wrapper?.querySelector('.errorMessage');
			if (!wrapper || !errorMessage) {
				return console.warn(new Error());
			}
			return { wrapper, errorMessage };
		}

		/**
		 * 入力項目下部にエラーメッセージを表示
		 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input 入力項目
		 * @param {string} message エラーメッセージ
		 */
		#displayErrorState(input, message) {
			const { wrapper, errorMessage } = this.#getElms(input);
			wrapper.classList.add('is-error');
			// label.insertAdjacentHTML('beforeend', `<span class="errorMessage">${message || input.validationMessage}</span>`);
			errorMessage.textContent = message || input.validationMessage;
		}

		/**
		 * 引数から受け取った入力項目のエラー状態をクリア
		 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input 入力項目
		 */
		#resetErrorState(input) {
			const { wrapper, errorMessage } = this.#getElms(input);
			wrapper.classList.remove('is-error');
			errorMessage.textContent = '';
			input.setCustomValidity('');
		}

		/**
		 * カスタムルール
		 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input 入力項目
		 */
		#checkCustomValidation(input) {
			if (input.getAttribute('data-custom-rule') === 'test') {
				if (input.value !== '0') {
					input.setCustomValidity(input.title);
				} else {
					input.setCustomValidity('');
				}
			}
		}

		/**
		 * 引数に渡された要素にバリデーションを実行する
		 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input
		 */
		#validateTargetInput(input) {
			this.#resetErrorState(input);
			// カスタムルールの対象の場合
			if (this.#customRuleFormElms.includes(input)) {
				this.#checkCustomValidation(input);
			}
			input.checkValidity();
		}

		#checkValidity() {
			this.#customRuleFormElms.forEach((formElm) => this.#validateTargetInput(formElm));
			return this.#form.checkValidity();
		}

		/**
		 * `invalid`時のハンドラ関数
		 * - エラーメッセージを表示
		 * @param {Event} e
		 */
		#handleInvalid(e) {
			/** @type {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} */
			const input = e.currentTarget;

			if (input.validity.valueMissing) {
				input.setCustomValidity('必須入力項目です。');
				this.#displayErrorState(input, input.validationMessage);
			} else if (input.validity.typeMismatch) {
				this.#displayErrorState(input, input.validationMessage);
			} else if (input.validity.patternMismatch) {
				input.setCustomValidity(input.title);
				this.#displayErrorState(input, input.validationMessage);
			} else {
				this.#displayErrorState(input, input.validationMessage);
			}

			// input.setCustomValidity('');
		}

		/**
		 * フォーム送信時のハンドラ関数
		 * @param {Event} e
		 */
		#handleSubmit(e) {
			e.preventDefault();
			this.#formElms.forEach((formElm) => this.#resetErrorState(formElm));

			const isValid = this.#checkValidity();
			if (!isValid) {
				const firstInvalidInput = this.#formElms.find((formElm) => !formElm.validity.valid);
				firstInvalidInput.focus();
				return;
			}
			alert('valid!');
		}

		/** @summary 各種ハンドラの登録 */
		#registerEventListener() {
			this.#formElms.forEach((formElm) => {
				// チェックボックス・ラジオボタン・セレクトボックスの場合は`change`イベント時に再検証発火
				if (formElm.type === 'radio' || formElm.type === 'checkbox' || formElm instanceof HTMLSelectElement) {
					formElm.addEventListener('change', (e) => this.#validateTargetInput(e.currentTarget));
				} else {
					formElm.addEventListener('blur', (e) => this.#validateTargetInput(e.currentTarget));
				}
				formElm.addEventListener('invalid', (e) => this.#handleInvalid(e));
			});

			// if (this.#customRuleFormElms) {
			// 	this.#customRuleFormElms.addEventListener('');
			// }

			this.#form.addEventListener('submit', (e) => this.#handleSubmit(e), { passive: false });
		}

		init() {
			if (!this.#formElms.length) {
				return console.warn(new Error());
			}
			this.#registerEventListener();
		}
	}

	window.addEventListener('DOMContentLoaded', () => {
		/** @type {HTMLFormElement} */
		const form = document.getElementById('form');
		const validateInstance = new Validate(form);
		validateInstance.init();
	});
})();

// const form = document.getElementById('form');
// const inputElms = form.querySelectorAll('input');

// form.addEventListener(
// 	'submit',
// 	(e) => {
// 		e.preventDefault();
// 		inputElms.forEach((input) => {
// 			const label = input.closest('label');
// 			label.classList.remove('is-error');
// 			const errorMessage = label.nextElementSibling;
// 			errorMessage.textContent = '';
// 		});
// 		const result = form.checkValidity();
// 		if (result) {
// 			alert('submit!');
// 		}
// 	},
// 	{ passive: false }
// );
// inputElms.forEach((input) => {
// 	input.addEventListener('invalid', (e) => {
// 		const currentTarget = e.currentTarget;
// 		const label = currentTarget.closest('label');
// 		label.classList.add('is-error');
// 		const errorMessage = label.nextElementSibling;
// 		if (currentTarget.validity.patternMismatch) {
// 			currentTarget.setCustomValidity('「banana」もしくは「cherry」を入力してください。');
// 		}
// 		errorMessage.textContent = currentTarget.validationMessage;
// 		currentTarget.setCustomValidity('');
// 	});
// });

// input.addEventListener('invalid', () => {
// 	input.classList.add('is-error');
// 	if (input.validity.patternMismatch) {
// 		input.setCustomValidity('「banana」もしくは「cherry」を入力してください。');
// 	}
// 	errorMessage.textContent = input.validationMessage;
// 	input.setCustomValidity('');
// });

// if (input.checkValidity()) {
// 	errorMessage.textContent = input.validationMessage;
// }
