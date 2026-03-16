import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import {
getFirestore,
collection,
addDoc,
getDocs,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

const firebaseConfig = {
apiKey: "AIzaSyCF3y6cr25Ls9MKM2YPJLHJEAgA3PzRp-o",
authDomain: "bsa-training-admin.firebaseapp.com",
projectId: "bsa-training-admin",
storageBucket: "bsa-training-admin.appspot.com",
messagingSenderId: "972595893407",
appId: "1:972595893407:web:f415a0f24602bd9603beaa"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const studentsRef = collection(db,"students")

const table = document.getElementById("studentTable")

const modal = document.getElementById("studentModal")

const nameInput = document.getElementById("studentName")
const emailInput = document.getElementById("studentEmail")
const tierInput = document.getElementById("tier")
const paymentInput = document.getElementById("paymentStatus")
const portalInput = document.getElementById("portalStatus")

function priceForTier(tier){

if(tier==="FULL") return 150
if(tier==="DISC") return 100
return 0

}

function generateCode(tier){

const rand = Math.floor(Math.random()*9000)+1000
return `BSA-${tier}-${rand}`

}

async function loadStudents(){

table.innerHTML=""

let total=0
let paid=0
let pending=0
let revenue=0

const snapshot = await getDocs(studentsRef)

snapshot.forEach(docSnap=>{

const s=docSnap.data()

total++

if(s.paymentStatus==="Paid"){
paid++
revenue+=s.price
}else{
pending++
}

const tr=document.createElement("tr")

tr.innerHTML=`

<td>${s.name}</td>
<td>${s.email}</td>
<td>${s.tier}</td>
<td>$${s.price}</td>
<td><span class="status ${s.paymentStatus==="Paid"?"paid":"unpaid"}">${s.paymentStatus}</span></td>
<td>${s.portalStatus}</td>
<td>${s.progressLabel||"Not Started"}</td>
<td>
<button onclick="lock('${docSnap.id}')">Lock</button>
<button onclick="unlock('${docSnap.id}')">Unlock</button>
</td>

`

table.appendChild(tr)

})

document.getElementById("metricStudents").innerText=total
document.getElementById("metricPaid").innerText=paid
document.getElementById("metricPending").innerText=pending
document.getElementById("metricRevenue").innerText="$"+revenue

}

window.lock=async function(id){

await updateDoc(doc(db,"students",id),{
portalStatus:"Locked"
})

loadStudents()

}

window.unlock=async function(id){

await updateDoc(doc(db,"students",id),{
portalStatus:"Active"
})

loadStudents()

}

document.getElementById("addStudentBtn").onclick=()=>{

modal.style.display="flex"

}

document.getElementById("saveStudent").onclick=async()=>{

const name=nameInput.value
const email=emailInput.value
const tier=tierInput.value
const payment=paymentInput.value
const portal=portalInput.value

const price=priceForTier(tier)

await addDoc(studentsRef,{
name,
email,
tier,
price,
paymentStatus:payment,
portalStatus:portal,
progressLabel:"Not Started",
accessCode:generateCode(tier),
createdAt:new Date()
})

modal.style.display="none"

loadStudents()

}

document.getElementById("refreshBtn").onclick=loadStudents

document.getElementById("exportBtn").onclick=async()=>{

const snapshot=await getDocs(studentsRef)

let csv="name,email,tier,price,payment,status\n"

snapshot.forEach(d=>{

const s=d.data()

csv+=`${s.name},${s.email},${s.tier},${s.price},${s.paymentStatus},${s.portalStatus}\n`

})

const blob=new Blob([csv])

const a=document.createElement("a")

a.href=URL.createObjectURL(blob)

a.download="bsa_students.csv"

a.click()

}

loadStudents()
