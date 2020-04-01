///////////////////
//Budget Controller
///////////////////

var budgetController = (function(){

    //Function Constructor
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPerc = function(totalIncome){
        
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function()
    {
        return this.percentage;
    }
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    

    var data = {
    allItems : {
        exp : [],
        inc : []
        },
    totals:{
        exp:0,
        inc:0
    },
        budget: 0,
        percentage: -1
    
    };
    
    var calculateTotal = function (type){
      var sum = 0;
      
        
      data.allItems[type].forEach(function(cur){
          sum += cur.value;
      });
        data.totals[type] = sum;
    };
    
    
    return {
    addItem : function(type,desc,val){
        var newItem,ID;
        
        //Create new ID based on last entry
        if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length-1].id + 1;
        } else { ID = 0; }
            
        
        if(type === 'exp')
        {
            newItem = new Expense(ID,desc,val);
        }
        else if(type === 'inc')
        {
            newItem = new Income(ID,desc,val);
        }
        
            
        //Push it into the data structure
        data.allItems[type].push(newItem);
            
        return newItem;
    
    },
    
    deleteItem: function(type,id){
        var ids,index;
        //ids = [1 2 3 4 5 6 8]
        
        ids = data.allItems[type].map(function(current){
            return current.id; 
        });
        
        //to store the index of id in index variable
        index = ids.indexOf(id);
        
        if(index !== -1){
            data.allItems[type].splice(index, 1);
        }
    },
        
    calculcateBudget: function()
    {
        //calculate total income and expenses
        
        calculateTotal('exp');
        calculateTotal('inc');
        
        
        //calculate the budget: income- expenses
        data.budget = data.totals.inc - data.totals.exp;
        
        //calculate the percentage of income we spent
        if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp * 100) / data.totals.inc);    
        }
        
    },
    getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },
            
    calculatePercentages: function(){
        data.allItems.exp.forEach(function(cur){
            cur.calcPerc(data.totals.inc);
        });
        
    }, 
    
    getPercentages: function(){
      var allPerc = data.allItems.exp.map(function(cur){
          return cur.getPercentage();
      });
        return allPerc;
    },
        
    testing: function(){
        console.log(data);
    }
        
    };
    
    
})();
/////////////////////////////////////////////////////////////////////////////
////////////////BUDGET CONTROLLER ENDS HERE//////////////////////////////////
/////////////////////////////////////////////////////////////////////////////


///////////////
//UI Controller
///////////////
var UIController = (function () {
  
    //HTML Class names for easy identification and updation if any in future
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container : '.container',
        expPercLabel: '.item__percentage',
        monthLabel : '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
            var numSplit,int,dec;
                            
            num = Math.abs(num);
            
            num = num.toFixed(2);
            
            numSplit = num.split('.');
        
            int = numSplit[0];
        
            dec = numSplit[1];
            
            if(int.length > 3){
                int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
                //This put a comma after thousand figure
            }
            
            type === 'exp' ? sign = '-' : sign = '+';
    
            return (type === 'exp' ? '-' : '+') + ' ' + int +'.'+ dec;
        
        
        };
    
    //Self made function 
    var nodeListForEach = function(list, callback){
        for(var i =0 ; i<list.length ; i++){
            callback(list[i],i);
        }
    };
    
    return {
      getInput: function(){
          return {
            type : document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
          };     
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        },
        
        addListItem: function(obj, type){
            var html,newHtml,element;
            
            //Create HTML string with placeholder text
            if(type === 'inc')
            {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp')
            {
            element = DOMstrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button</div></div></div>';
            }
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
                        
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        
        deleteListItem: function(selectorID){
          var el = document.getElementById(selectorID);
          el.parentNode.removeChild(el);
        },
        
        
        clearFields: function(){
            var fields,fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ','+DOMstrings.inputValue);
            
            
            //QuerySelectorAll returns the data in a list and to convert that list to 
            //Array following method borrowing using call is used from Array Object
            fieldsArr = Array.prototype.slice.call(fields);
            
            
            //Just like a for loop function but more effective
            fieldsArr.forEach(function(current, index, array){
                current.value = '';
            });
            //fieldsArr[0].focus();
            document.querySelector('.add__type').focus();
            //This code select the Income/Expense Drop Down Menu
            
        },
        
        displayBudget: function(obj){
            
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,obj.budget>=0?'inc':'exp');
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome,'inc');
            
             document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses,'exp');
             
           if(obj.percentage > 0){ document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%';     
            }
            else{
             document.querySelector(DOMstrings.percentageLabel).textContent = '--%';     
            } 
        },
        
        displayPercentages: function(percentages){
            
            var fields = document.querySelectorAll(DOMstrings.expPercLabel);
            
            nodeListForEach(fields, function(cur,index){
                if(percentages[index] > 0){
                    cur.textContent = percentages[index]+' %';
                }
                else{
                    cur.textContent = '---%';
                }
            });        
        },
        
        displayMonth: function(){
            var now,year,months,month;
            var now = new Date();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            
            month = now.getMonth();
            
            month = months[month];
            
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.monthLabel).textContent = month + ' ' +year;
        },
        
        changedType: function(){
            var fields = document.querySelectorAll(
            DOMstrings.inputType+','+
            DOMstrings.inputDescription+','+
            DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
               cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
        
    };
})();

/////////////////////////////////////////////////////////////////////////////
////////////////////UI CONTROLLER ENDS HERE//////////////////////////////////
/////////////////////////////////////////////////////////////////////////////


///////////////////////
//Global App Controller
///////////////////////
var controller = (function(budgetCtrl, UICtrl){
   
    var setupEventListeners = function(){
   
     var DOM = UICtrl.getDOMstrings(); 
    //Link to DOMstrings Object using getDOMstrings method
    
    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
    
     document.addEventListener('keypress',function(event){
       if(event.keyCode === 13  || event.which === 13){
           ctrlAddItem();
       }
        
    });
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
     document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };
    
    
    var updateBudget = function(){
                
    //1. Calculate the Budget
     budgetCtrl.calculcateBudget();   
    
    //2. Return the Budget
    var budget = budgetCtrl.getBudget();    
    
    //3. Display the Budget
    UICtrl.displayBudget(budget);
    
    };
    
    
    var updatePercentages = function(){
    //1. Calculcate percentage
    budgetCtrl.calculatePercentages();
        
    //2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
        
    //3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
        
    };
    
    
    
   var ctrlAddItem = function(){
    
   var input,newItem;
       
       
   //1. Get the filled input data
   input = UICtrl.getInput();
       
   if(input.description !== "" && !isNaN(input.value) && input.value > 0){
   //2. Add the item to the budget controller
   newItem = budgetCtrl.addItem(input.type,input.description,input.value);

    //3. Add the item to UI
    UICtrl.addListItem(newItem, input.type);
    UICtrl.clearFields();   //Clear the fields after updating the UI
       
    //4. Calculate and update budget
    updateBudget();
       
    //5. calculate and update percentages
    updatePercentages();
    
   }    
};
    
    
    var ctrlDeleteItem = function(event){
        var itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. Delete the Item from the data structure
            budgetCtrl.deleteItem(type,ID);
            
            //2. Delete the Item from UI
            UICtrl.deleteListItem(itemID);
            
            //3. Update and show the new Budget
            updateBudget();
            
            //4. Update Percentages
            updatePercentages();
        }
        
        
    };
   
    
    
    return {
        init : function(){
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: 0
            });
            UICtrl.displayMonth();
        }
    };
})(budgetController, UIController);
/////////////////////////////////////////////////////////////////////////////
////////////////////GLOBAL CONTROLLER ENDS HERE//////////////////////////////
/////////////////////////////////////////////////////////////////////////////


controller.init();