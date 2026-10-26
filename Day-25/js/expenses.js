function expenses() { return Store.get("inventory_expenses", []); }
function expenseFormFields(e={}) {
  return [
    {name:"title",label:"Expense title",required:true,value:e.title||"",full:true},
    {name:"category",label:"Category",type:"select",options:["Rent","Transport","Salary","Electricity","Other"],value:e.category||"Other"},
    {name:"amount",label:"Amount (₹)",type:"number",min:"0.01",step:"0.01",required:true,value:e.amount??""},
    {name:"date",label:"Expense date",type:"date",required:true,value:e.date||Store.today()},
    {name:"description",label:"Description",type:"textarea",value:e.description||"",full:true}
  ];
}
function saveExpense(data,id="") {
  if(!data.title.trim()||Number(data.amount)<=0) throw new Error("Enter an expense title and an amount greater than zero.");
  const list=expenses(), item={...data,id:id||Store.id("EXP"),amount:Number(data.amount),title:data.title.trim()};
  Store.set("inventory_expenses",id?list.map(e=>e.id===id?item:e):[item,...list]);
  if(!id) Notifications.add(`Expense "${item.title}" of ${Store.currency(item.amount)} was recorded.`, "informational", `expense-${item.id}`);
}
function deleteExpense(id) {
  const e=expenses().find(x=>x.id===id); if(!e)return;
  if(!confirm(`Delete expense "${e.title}"?`))return;
  Store.set("inventory_expenses",expenses().filter(x=>x.id!==id));refreshAll();showToast("Expense deleted.");
}
function renderExpenses() {
  const search=(document.getElementById("expenseSearch")?.value||"").toLowerCase(), category=document.getElementById("expenseCategoryFilter")?.value||"", start=document.getElementById("expenseStart")?.value||"", end=document.getElementById("expenseEnd")?.value||"";
  const list=expenses().filter(e=>(e.title+" "+e.description).toLowerCase().includes(search)&&(!category||e.category===category)&&(!start||e.date>=start)&&(!end||e.date<=end)).sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById("expensesTable").innerHTML=list.length?`<div class="table-wrap"><table><thead><tr><th>Expense title</th><th>Category</th><th>Amount</th><th>Date</th><th>Description</th><th>Actions</th></tr></thead><tbody>${list.map(e=>`<tr><td><strong>${Store.escape(e.title)}</strong><small style="display:block;color:#999cb0;margin-top:4px">${Store.escape(e.id)}</small></td><td>${Store.escape(e.category)}</td><td><strong>${Store.currency(e.amount)}</strong></td><td>${Store.date(e.date)}</td><td>${Store.escape(e.description||"—")}</td><td><button class="mini-button" data-delete-expense="${Store.escape(e.id)}">Delete</button></td></tr>`).join("")}</tbody></table></div>`:emptyTable("No expenses found","Add an expense or clear your filters.");
}
