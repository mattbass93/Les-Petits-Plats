import { recipes } from "./recipes.js";
console.log(recipes);

const cardContainer = document.getElementById("card-container");
const totalNbrOfRecipes = document.getElementById("total-nbr-of-recipes");
const searchInput = document.querySelector(".search-bar");

const ingredientsFiltersList = document.getElementById("ingredients-filters-list");
const applianceFiltersList = document.getElementById("appliance-filters-list");
const ustensilsFiltersList = document.getElementById("ustensils-filters-list");
const filtersActiveList = document.getElementById("filters-active-list");

const activeFilters = {
    ingredients: new Set(),
    appliance: new Set(),
    ustensils: new Set()
};

// Function to create the list of recipes
function createRecipesList(recipes) {
    cardContainer.innerHTML = "";
    recipes.forEach(({ time, name, image, description, ingredients }) => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add("card", "recipe-card", "p-0", "col-11", "col-md-5", "col-xl-5", "col-xxl-3");

        const recipeTime = document.createElement('div');
        recipeTime.classList.add("recipe-time", "bg-warning", "text-dark");
        recipeTime.textContent = `${time} min`;

        const recipeImg = document.createElement('img');
        recipeImg.src = `images_recettes/${image}`;
        recipeImg.alt = name;
        recipeImg.classList.add("card-img-top", "mb-3");

        const cardBody = document.createElement('div');
        cardBody.classList.add("card-body");

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add("card-title", "mb-3");
        cardTitle.textContent = name;

        const recetteText = document.createElement('div');
        recetteText.classList.add("mb-2", "text-secondary");
        recetteText.textContent = "Recette";

        const cardText = document.createElement('p');
        cardText.id = "card-text";
        cardText.classList.add("mb-4", "card-text");
        cardText.textContent = description;

        const ingredientsText = document.createElement('div');
        ingredientsText.classList.add("mb-2", "text-secondary");
        ingredientsText.textContent = "Ingrédients";

        const cardIngredients = document.createElement('div');
        cardIngredients.classList.add("card-ingredients", "d-flex", "gap-3", "flex-wrap", "mb-5");

        ingredients.forEach(ingredient => {
            const ingredientDiv = document.createElement('div');
            ingredientDiv.classList.add("ingredient", "d-flex", "flex-column", "col-5");

            const ingredientName = document.createElement('span');
            ingredientName.classList.add("ingredient-name");
            ingredientName.textContent = ingredient.ingredient;

            ingredientDiv.appendChild(ingredientName);

            if (ingredient.quantity) {
                const ingredientQuantity = document.createElement('span');
                ingredientQuantity.classList.add("ingredient-quantity", "text-secondary");
                ingredientQuantity.textContent = `${ingredient.quantity} ${ingredient.unit || ''}`;
                ingredientDiv.appendChild(ingredientQuantity);
            }

            cardIngredients.appendChild(ingredientDiv);
        });

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(recetteText);
        cardBody.appendChild(cardText);
        cardBody.appendChild(ingredientsText);
        cardBody.appendChild(cardIngredients);

        recipeDiv.appendChild(recipeTime);
        recipeDiv.appendChild(recipeImg);
        recipeDiv.appendChild(cardBody);

        cardContainer.appendChild(recipeDiv);
    });
    totalNbrOfRecipes.textContent = `${recipes.length} recettes`;
}


// Generic function to generate filters
function generateFilters(recipes, filterType, filterList, filterFunction, activeFilterSet) {
    const filterSet = new Set();
    recipes.forEach(recipe => {
        if (filterType === 'ingredients') {
            recipe.ingredients.forEach(item => !activeFilterSet.has(item.ingredient) && filterSet.add(item.ingredient));
        } else if (filterType === 'appliance') {
            !activeFilterSet.has(recipe.appliance) && filterSet.add(recipe.appliance);
        } else if (filterType === 'ustensils') {
            recipe.ustensils.forEach(item => !activeFilterSet.has(item) && filterSet.add(item));
        }
    });

    filterList.innerHTML = "";
    filterSet.forEach(filterItem => {
        const filterElement = document.createElement('li');
        filterElement.innerHTML = `<a id="${filterItem.toLowerCase().replace(/ /g, '-')}-filter" class="dropdown-item" href="#">${filterItem}</a>`;
        filterList.appendChild(filterElement);

        filterElement.addEventListener("click", () => filterFunction(filterItem));
    });
}

function addActiveFilter(filterType, filterItem) {
    const filterId = `${filterItem.toLowerCase().replace(/ /g, '-')}-active`;
    if (!document.getElementById(filterId)) {
        const activeFilterElement = document.createElement('span');
        activeFilterElement.id = filterId;
        activeFilterElement.classList.add("col-3", "btn", "btn-custom", "filter-active", "bg-warning", "mb--md-5");
        activeFilterElement.innerText = filterItem;
        activeFilters[filterType].add(filterItem);
        activeFilterElement.addEventListener("click", () => {
            activeFilterElement.remove();
            activeFilters[filterType].delete(filterItem);
            updateFilteredRecipes();
        });
        filtersActiveList.appendChild(activeFilterElement);
    }
}

//Filtre la recette en fonction des filtres actifs
function applyFilters(recipes) {
    return recipes.filter(recipe => {
        //.every vérifie si tous les filtres actifs est présent dans les ingrédients de la recette et .some vérifie qu'au moins un ingrédient correspond au filtre actif
        const matchesIngredients = [...activeFilters.ingredients].every(filter => recipe.ingredients.some(ing => ing.ingredient === filter));
        const matchesAppliance = [...activeFilters.appliance].every(filter => recipe.appliance === filter);
        const matchesUstensils = [...activeFilters.ustensils].every(filter => recipe.ustensils.includes(filter));
        return matchesIngredients && matchesAppliance && matchesUstensils;
    });
}

function applySearch(recipes, searchString) {
    return recipes.filter(recipe => {
        const searchLower = searchString.toLowerCase();
        return recipe.name.toLowerCase().includes(searchLower) ||
            recipe.description.toLowerCase().includes(searchLower) ||
            recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(searchLower));
    });
}

//MAJ des recettes filtrées
function updateFilteredRecipes() {
    let filteredArray = applyFilters(recipes);
    const searchString = searchInput.value.toLowerCase();
    if (searchString.length >= 3) {
        filteredArray = applySearch(filteredArray, searchString);
    }
    createRecipesList(filteredArray);
    updateFilters(filteredArray);
}

function filterByIngredient(ingredient) {
    addActiveFilter('ingredients', ingredient);
    updateFilteredRecipes();
}

function filterByAppliance(appliance) {
    addActiveFilter('appliance', appliance);
    updateFilteredRecipes();
}

function filterByUstensil(ustensil) {
    addActiveFilter('ustensils', ustensil);
    updateFilteredRecipes();
}

//MAJ des filtres
function updateFilters(recipes) {
    generateFilters(recipes, 'ingredients', ingredientsFiltersList, filterByIngredient, activeFilters.ingredients);
    generateFilters(recipes, 'appliance', applianceFiltersList, filterByAppliance, activeFilters.appliance);
    generateFilters(recipes, 'ustensils', ustensilsFiltersList, filterByUstensil, activeFilters.ustensils);
}

createRecipesList(recipes);
updateFilters(recipes);

searchInput.addEventListener("input", updateFilteredRecipes);