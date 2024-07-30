import { recipes } from "./recipes.js";
console.log(recipes);

// DOM elements
const cardContainer = document.getElementById("card-container");
let totalNbrOfRecipes = document.getElementById("total-nbr-of-recipes");
const searchInput = document.querySelector(".search-bar");

const ingredientsFiltersList = document.getElementById("ingredients-filters-list");
const applianceFiltersList = document.getElementById("appliance-filters-list");
const ustensilsFiltersList = document.getElementById("ustensils-filters-list");

const filtersActiveList = document.getElementById("filters-active-list");

// Function to create the list of recipes
function createRecipesList(recipes) {
    cardContainer.innerHTML = "";  // Clear the card container before adding new recipes
    recipes.forEach(recipeCard => {
        const { time, name, image, description, ingredients } = recipeCard;

        // Create a new div for each recipe
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add("card", "recipe-card", "p-0", "col-11", "col-md-5", "col-xl-5", "col-xxl-3");  // Bootstrap grid classes
        recipeDiv.innerHTML = `
                <div class="recipe-time bg-warning text-dark">${time} min</div>
                <img src="images_recettes/${image}" class="card-img-top mb-3" alt="${name}">
                <div class="card-body">
                    <h5 class="card-title mb-3">${name}</h5>
                    <div class="mb-2 text-secondary">Recette</div>
                    <p id="card-text" class="mb-4 card-text">${description}</p>
                    <div class="mb-2 text-secondary">Ingrédients</div>
                    <div class="card-ingredients d-flex gap-3 flex-wrap mb-5">
                        ${ingredients.map(ingredient => `
                            <div class="ingredient d-flex flex-column col-5">
                                <span class="ingredient-name">${ingredient.ingredient}</span>
                                ${ingredient.quantity ? `<span class="ingredient-quantity text-secondary">${ingredient.quantity} ${ingredient.unit ? ingredient.unit : ''}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            
        `;

        cardContainer.appendChild(recipeDiv);
    });
    totalNbrOfRecipes.innerText = `${recipes.length} recettes`;
}

// Generic function to generate filters
function generateFilters(recipes, filterType, filterList, filterFunction) {
    filterList.innerHTML = ''; // Clear the existing filters

    const filterSet = new Set();

    recipes.forEach(recipe => {
        if (filterType === 'ingredients') {
            recipe.ingredients.forEach(item => filterSet.add(item.ingredient));
        } else if (filterType === 'appliance') {
            filterSet.add(recipe.appliance);
        } else if (filterType === 'ustensils') {
            recipe.ustensils.forEach(item => filterSet.add(item));
        }
    });

    filterSet.forEach(filterItem => {
        const filterElement = document.createElement('li');
        filterElement.innerHTML = `<a id="${filterItem.toLowerCase().replace(/ /g, '-')}-filter" class="dropdown-item" href="#">${filterItem}</a>`;
        filterList.appendChild(filterElement);

        // Add event listener to each filter
        filterElement.addEventListener("click", () => filterFunction(filterItem));
    });
}

// Function to add active filter
function addActiveFilter(filterType, filterItem) {
    const filterId = `${filterItem.toLowerCase().replace(/ /g, '-')}-active`;
    if (!document.getElementById(filterId)) {
        const activeFilterElement = document.createElement('span');
        activeFilterElement.id = filterId;
        activeFilterElement.classList.add("col-3", "btn", "btn-custom", "filter-active", "bg-warning", "mb-5",);
        activeFilterElement.innerText = filterItem;
        activeFilterElement.addEventListener("click", () => {
            activeFilterElement.remove();
            // Add logic to handle filter removal and update the recipe list accordingly
            removeFilterAndUpdateRecipes(filterType, filterItem);
        });
        filtersActiveList.appendChild(activeFilterElement);
    }
}

// Function to remove a filter and update the recipe list
function removeFilterAndUpdateRecipes(filterType, filterItem) {
    let filteredArray = [...recipes];
    // Reapply all active filters except the one removed
    document.querySelectorAll('#filters-active-list .badge').forEach(activeFilter => {
        const activeFilterText = activeFilter.innerText;
        if (activeFilterText !== filterItem) {
            if (filterType === 'ingredients') {
                filteredArray = filteredArray.filter(recipe =>
                    recipe.ingredients.some(item => item.ingredient === activeFilterText)
                );
            } else if (filterType === 'appliance') {
                filteredArray = filteredArray.filter(recipe =>
                    recipe.appliance === activeFilterText
                );
            } else if (filterType === 'ustensils') {
                filteredArray = filteredArray.filter(recipe =>
                    recipe.ustensils.includes(activeFilterText)
                );
            }
        }
    });
    createRecipesList(filteredArray);
    updateFilters(filteredArray);
}

// Specific filter functions
function filterByIngredient(ingredient) {
    addActiveFilter('ingredients', ingredient);
    const filteredArray = recipes.filter(recipe =>
        recipe.ingredients.some(item => item.ingredient === ingredient)
    );
    createRecipesList(filteredArray);
    updateFilters(filteredArray);
}

function filterByAppliance(appliance) {
    addActiveFilter('appliance', appliance);
    const filteredArray = recipes.filter(recipe =>
        recipe.appliance === appliance
    );
    createRecipesList(filteredArray);
    updateFilters(filteredArray);
}

function filterByUstensil(ustensil) {
    addActiveFilter('ustensils', ustensil);
    const filteredArray = recipes.filter(recipe =>
        recipe.ustensils.includes(ustensil)
    );
    createRecipesList(filteredArray);
    updateFilters(filteredArray);
}

// Function to update filters
function updateFilters(recipes) {
    generateFilters(recipes, 'ingredients', ingredientsFiltersList, filterByIngredient);
    generateFilters(recipes, 'appliance', applianceFiltersList, filterByAppliance);
    generateFilters(recipes, 'ustensils', ustensilsFiltersList, filterByUstensil);
}

// Initialize the page with all recipes, ingredient filters, appliance filters, and ustensil filters
createRecipesList(recipes);
updateFilters(recipes);

// Search functionality
searchInput.addEventListener("input", filterData);

function filterData(e) {
    const searchedString = e.target.value.toLowerCase();
    if (searchedString.length < 3) {
        createRecipesList(recipes);  // Show all recipes if less than 3 characters are typed
        updateFilters(recipes);
        return;
    }
    const filteredArray = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchedString) ||
        recipe.description.toLowerCase().includes(searchedString) ||
        recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(searchedString))
    );
    createRecipesList(filteredArray);
    updateFilters(filteredArray);
}
