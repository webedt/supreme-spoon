import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Hello World!</h1>
    <p class="message">
      Welcome to your Vite + TypeScript project
    </p>
    <div class="card">
      <button id="counter" type="button">Count is 0</button>
    </div>
  </div>
`

let counter = 0
const button = document.querySelector<HTMLButtonElement>('#counter')!

button.addEventListener('click', () => {
  counter++
  button.textContent = `Count is ${counter}`
})
