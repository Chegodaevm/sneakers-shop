import React from 'react';
import { Route } from 'react-router-dom';
import axios from 'axios';
import AppContext from './context';


import Header from './components/Header';
import Drawer from './components/Drawer';


import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Orders from './pages/Orders';


function App() {
  const [items, setItems] = React.useState([]);
  const [cartItems, setCartItems] = React.useState([]);
  const [favorites, setFavorites] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState('');
  const [cartOpened, setCartOpened] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        const [cartResponse, favoriteResponse, itemsResponse] = await Promise.all([
          axios.get('https://629fbfa3461f8173e4f0318a.mockapi.io/cart'),
          axios.get('https://629fbfa3461f8173e4f0318a.mockapi.io/favorites'),
          axios.get('https://629fbfa3461f8173e4f0318a.mockapi.io/items')
        ]);

        setIsLoading(false);
        setCartItems(cartResponse.data);
        setFavorites(favoriteResponse.data);
        setItems(itemsResponse.data);
      } catch (error) {
        alert('Ошибка при запросе данных')
      }
    }

    fetchData();
  }, [])

  const onAddToCart = async (obj) => {
    try {
      const findItem = cartItems.find((item) => Number(item.parentId) === Number(obj.id));
      if (findItem) {
        setCartItems((prev) => prev.filter((item) => Number(item.parentId) !== Number(obj.id)));
        await axios.delete(`https://629fbfa3461f8173e4f0318a.mockapi.io/cart/${findItem.id}`);
      } else {
        setCartItems((prev) => [...prev, obj]);
        const { data } = await axios.post('https://629fbfa3461f8173e4f0318a.mockapi.io/cart', obj);
        setCartItems((prev) =>
          prev.map((item) => {
            if (item.parentId === data.parentId) {
              return {
                ...item,
                id: data.id,
              };
            }
            return item;
          }),
        );
      }
    } catch (error) {
      alert('Ошибка при добавлении в корзину');
      console.error(error);
    }
  };

  const onRemoveItem = (id) => {
    try {
      setCartItems(prev => prev.filter(item => Number(item.id) !== Number(id)));
      axios.delete(`https://629fbfa3461f8173e4f0318a.mockapi.io/cart/${id}`);
    } catch (error) {
      alert('Ошибка при удалении из коризны');
      console.error(error);
    }
  }

  const onAddToFavorite = async (obj) => {
    try {
      if (favorites.find(favObj => favObj.id === obj.id)) {
        axios.delete(`https://629fbfa3461f8173e4f0318a.mockapi.io/favorites/${obj.id}`);
        setFavorites(prev => prev.filter(item => Number(item.id) !== Number(obj.id)));
      } else {
        const { data } = await axios.post('https://629fbfa3461f8173e4f0318a.mockapi.io/favorites', obj);
        setFavorites((prev) => [...prev, data]);
      }
    } catch (error) {
      alert('Не удалось добавить в избранное')
      console.error(error);
    }
  }

  const onChangeSearchInput = (event) => {
    setSearchValue(event.target.value);
  }

  const isItemAdded = (id) => {
    return cartItems.some((obj) => Number(obj.parentId) === Number(id));
  };

  return (
    <AppContext.Provider value={{
      items,
      cartItems,
      favorites,
      isItemAdded,
      setCartOpened,
      setCartItems,
      onAddToCart,
      onAddToFavorite
    }}>
      <div className="wrapper clear">

        <Drawer
          items={cartItems}
          onClose={() => setCartOpened(false)}
          onRemove={onRemoveItem}
          opened={cartOpened}
        />


        <Header onClickCart={() => setCartOpened(true)} />

        <Route path="/" exact>
          <Home
            items={items}
            cartItems={cartItems}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            onChangeSearchInput={onChangeSearchInput}
            onAddToFavorite={onAddToFavorite}
            onAddToCart={onAddToCart}
            isLoading={isLoading}
          />
        </Route>

        <Route path="/favorites" exact>
          <Favorites
            onAddToFavorite={onAddToFavorite}
          />
        </Route>

        <Route path="/orders">
          <Orders />
        </Route>

      </div>
    </AppContext.Provider>
  );
}

export default App;
