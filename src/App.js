import React, { useState, useRef } from 'react';
import './App.css';
import gamesData from './gamesData';

// 별점 렌더링 함수
function renderStars(rating, className = 'star') {
  let stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={className + (i < Math.round(rating) ? ' filled' : '')}>★</span>
    );
  }
  return stars;
}

// 데이터에서 유니크한 장르/플랫폼 추출
const getUnique = (key) => {
  const set = new Set();
  gamesData.forEach(game => {
    if (Array.isArray(game[key])) {
      game[key].forEach(v => set.add(v));
    } else if (game[key]) {
      set.add(game[key]);
    }
  });
  return Array.from(set);
};

const GENRES = getUnique('genre');
const PLATFORMS = getUnique('platform');
const PRICE_MIN = 0;
const PRICE_MAX = 100000;
const PRICE_STEP = 1000;

function App() {
  // 상태 관리
  const [page, setPage] = useState('main'); // main, list, detail
  const [filters, setFilters] = useState({ genre: [], price: PRICE_MAX, platform: [] });
  const [filteredGames, setFilteredGames] = useState(gamesData);
  const [selectedGame, setSelectedGame] = useState(null);
  const [reviews, setReviews] = useState({}); // {gameId: [{rating, comment, date}]}
  const [currentRating, setCurrentRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // 체크박스 핸들러
  const handleCheckbox = (type, value) => {
    setFilters(prev => {
      const arr = prev[type];
      if (arr.includes(value)) {
        return { ...prev, [type]: arr.filter(v => v !== value) };
      } else {
        return { ...prev, [type]: [...arr, value] };
      }
    });
  };

  // 가격 슬라이더 핸들러
  const handlePriceSlider = (e) => {
    setFilters(prev => ({ ...prev, price: Number(e.target.value) }));
  };

  // 필터 적용 함수
  const filterGames = () => {
    let result = gamesData.filter(game => {
      // 장르
      const genreOk = filters.genre.length === 0 || filters.genre.includes(game.genre) || (Array.isArray(game.genre) && filters.genre.some(g => game.genre.includes(g)));
      // 가격대
      let priceOk = true;
      if (filters.price === 0) {
        priceOk = game.price === 0;
      } else {
        priceOk = game.price <= filters.price;
      }
      // 플랫폼
      const platformOk = filters.platform.length === 0 || filters.platform.includes(game.platform) || (Array.isArray(game.platform) && filters.platform.some(p => game.platform.includes(p)));
      return genreOk && priceOk && platformOk;
    });
    setFilteredGames(result);
  };

  // 평균 평점 계산
  const getAverageRating = (gameId) => {
    const gameReviews = reviews[gameId] || [];
    if (gameReviews.length === 0) {
      return gamesData.find(g => g.id === gameId)?.rating || 0;
    }
    const sum = gameReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / gameReviews.length).toFixed(1);
  };

  // 페이지 전환 함수
  const showMainPage = () => setPage('main');
  const showGameList = () => {
    filterGames();
    setPage('list');
  };
  const showGameDetail = (game) => {
    setSelectedGame(game);
    setCurrentRating(5);
    setReviewComment('');
    setPage('detail');
  };

  // 리뷰 추가 함수
  const addReview = () => {
    if (!reviewComment.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    const gameId = selectedGame.id;
    const newReview = {
      id: Date.now(),
      rating: currentRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString()
    };
    setReviews(prev => ({
      ...prev,
      [gameId]: [newReview, ...(prev[gameId] || [])]
    }));
    setReviewComment('');
    setCurrentRating(5);
    alert('리뷰가 등록되었습니다!');
  };

  // 메인(필터) 페이지
  const MainPage = () => (
    <div className="main-page">
      <div className="main-container">
        <div className="main-header">
          <h1 className="main-title">게임체크</h1>
          <p className="main-subtitle">나만의 게임 추천 웹사이트</p>
          <div className="main-divider"></div>
        </div>
        <div className="filter-container">
          <h2 className="filter-title">🎮 게임 추천 조건을 선택하세요</h2>
          <div className="filter-grid">
            <div className="filter-group">
              <label className="filter-label">장르</label>
              <div className="chip-filter-group">
                {GENRES.map(genre => (
                  <div
                    key={genre}
                    className={
                      'chip' + (filters.genre.includes(genre) ? ' selected' : '')
                    }
                    onClick={() => handleCheckbox('genre', genre)}
                  >
                    {genre}
                  </div>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">가격대</label>
              <div className="slider-filter-group">
                <div className="slider-value-label">
                  {filters.price === 0 ? '무료만' : `${filters.price.toLocaleString()}원 이하`}
                </div>
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={filters.price}
                  onChange={handlePriceSlider}
                  className="price-slider"
                />
                <div className="slider-labels-simple">
                  <span className="slider-label-simple">0</span>
                  <span className="slider-label-simple" style={{float:'right'}}>{PRICE_MAX.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">플랫폼</label>
              <div className="chip-filter-group">
                {PLATFORMS.map(platform => (
                  <div
                    key={platform}
                    className={
                      'chip' + (filters.platform.includes(platform) ? ' selected' : '')
                    }
                    onClick={() => handleCheckbox('platform', platform)}
                  >
                    {platform}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="search-button" onClick={showGameList}>🔍 게임 추천받기</button>
        </div>
      </div>
    </div>
  );

  // 게임 리스트 페이지
  const GameList = () => (
    <div className="list-page">
      <div className="list-header">
        <div className="list-header-content">
          <button className="back-button" onClick={showMainPage}>← 뒤로가기</button>
          <span className="list-title">게임 추천 결과</span>
          <span className="game-count">총 {filteredGames.length}개</span>
        </div>
      </div>
      <div className="list-container">
        {filteredGames.length === 0 ? (
          <div className="no-games">
            <div className="no-games-icon">😢</div>
            <div>조건에 맞는 게임이 없습니다.</div>
          </div>
        ) : (
          <div className="games-grid">
            {filteredGames.map(game => (
              <div className="game-card" key={game.id}>
                <img src={game.image} alt={game.title} className="game-image" />
                <div className="game-info">
                  <div className="game-header">
                    <div>
                      <div className="game-title">{game.title}</div>
                      <div style={{display:'flex', flexWrap:'wrap', gap:'0.4em 0.5em', marginTop:'0.2em'}}>
                        {(Array.isArray(game.genre) ? game.genre : [game.genre]).map((g, idx) => (
                          <span className="game-genre genre-chip" key={g+idx}>{g}</span>
                        ))}
                      </div>
                    </div>
                    <div className="game-rating">
                      <span className="stars">{renderStars(getAverageRating(game.id))}</span>
                      <span>{getAverageRating(game.id)}</span>
                    </div>
                  </div>
                  <div className="game-description">{game.description}</div>
                  <div className="game-footer">
                    <span className="game-price">{game.price === 0 ? '무료' : game.price.toLocaleString() + '원'}</span>
                    <span className="game-platform">{Array.isArray(game.platform) ? game.platform.join(', ') : game.platform}</span>
                  </div>
                  <button className="detail-button" onClick={() => showGameDetail(game)}>상세보기</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 게임 상세 페이지
  const textareaRef = useRef(null);
  const GameDetail = () => {
    if (!selectedGame) return null;
    const gameReviews = reviews[selectedGame.id] || [];
    return (
      <div className="detail-page">
        <div className="list-header">
          <div className="list-header-content">
            <button className="back-button" onClick={showGameList}>← 게임 목록으로</button>
          </div>
        </div>
        <div className="detail-container">
          <div className="detail-card">
            <div className="detail-header">
              <img src={selectedGame.image} alt={selectedGame.title} className="detail-image" />
              <div className="detail-overlay"></div>
              <div className="detail-info">
                <h1 className="detail-title">{selectedGame.title}</h1>
                <div className="detail-tags">
                  {(Array.isArray(selectedGame.genre) ? selectedGame.genre : [selectedGame.genre]).map((g, idx) => (
                    <span className="detail-tag genre-tag" key={g+idx}>{g}</span>
                  ))}
                  <span className="detail-tag platform-tag">{selectedGame.platform}</span>
                  <span className="detail-price">{selectedGame.price === 0 ? '무료' : `₩${selectedGame.price.toLocaleString()}`}</span>
                </div>
              </div>
            </div>
            <div className="detail-content">
              <div className="content-grid">
                <div className="main-content">
                  <section>
                    <h2 className="section-title">게임 정보</h2>
                    <div className="game-details">
                      <div className="detail-item">
                        <span className="detail-label">출시일:</span>
                        <span>{selectedGame.releaseDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">평점:</span>
                        <div className="stars">{renderStars(getAverageRating(selectedGame.id))}</div>
                        <span style={{ marginLeft: '0.25rem' }}>{getAverageRating(selectedGame.id)}</span>
                      </div>
                    </div>
                  </section>
                  <section>
                    <h2 className="section-title">스토리</h2>
                    <p className="story-text">{selectedGame.story}</p>
                  </section>
                  <section>
                    <h2 className="section-title">스크린샷</h2>
                    <div className="screenshots-grid">
                      {selectedGame.screenshots.map((s, i) => (
                        <img src={s} alt={`${selectedGame.title} 스크린샷 ${i + 1}`} className="screenshot" key={i} />
                      ))}
                    </div>
                  </section>
                  <section>
                    <h2 className="section-title">사용자 리뷰</h2>
                    <div className="review-form">
                      <h3>리뷰 작성하기</h3>
                      <div className="form-group">
                        <label className="form-label">평점</label>
                        <div className="rating-stars">
                          {[1,2,3,4,5].map(rating => (
                            <span
                              key={rating}
                              className={"rating-star" + (currentRating >= rating ? ' active' : '')}
                              onClick={() => setCurrentRating(rating)}
                            >★</span>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">리뷰 내용</label>
                        <textarea
                          className="review-textarea"
                          placeholder="게임에 대한 솔직한 리뷰를 작성해주세요..."
                          rows={3}
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          ref={textareaRef}
                          onFocus={e => {
                            // 스크롤 이동 방지 임시방편
                            e.preventDefault();
                            e.stopPropagation();
                            // 추가로, 포커스 시 스크롤을 textarea 위치로 강제 이동하지 않도록 함
                            if (document.activeElement === textareaRef.current) {
                              window.scrollTo({ top: window.scrollY });
                            }
                          }}
                        />
                      </div>
                      <button type="button" className="submit-button" onClick={addReview}>리뷰 등록</button>
                    </div>
                    <div id="reviewsList">
                      {gameReviews.map(review => (
                        <div className="review-item" key={review.id}>
                          <div className="review-header">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="stars">{renderStars(review.rating)}</div>
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{review.rating}/5</span>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{review.date}</span>
                          </div>
                          <p style={{ color: '#374151' }}>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
                <div className="sidebar">
                  <div className="purchase-section">
                    <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>게임 구매</h3>
                    <div className="purchase-buttons">
                      <button className="purchase-button steam-button">💾 Steam에서 구매</button>
                      <button className="purchase-button official-button">🔗 공식 사이트</button>
                    </div>
                  </div>
                  <div className="requirements-section">
                    <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>시스템 요구사양</h3>
                    <div className="requirements-text">
                      <p>{selectedGame.systemRequirements}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 렌더링
  return (
    <div>
      {page === 'main' && <MainPage />}
      {page === 'list' && <GameList />}
      {page === 'detail' && <GameDetail />}
    </div>
  );
}

export default App;
