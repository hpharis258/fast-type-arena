import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  wpm: number;
  accuracy: number;
  correct_chars: number;
  incorrect_chars: number;
  total_chars: number;
  duration: number;
  created_at: string;
  display_name: string | null;
  total_count: number;
}

export default function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [page, setPage] = useState(1); 
  const [pageLength, setPageLength] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'wpm' | 'accuracy' | 'created_at'>('wpm');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterDuration, setFilterDuration] = useState<'all' | '15' | '30' | '60'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isTyping = useRef(false);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Maintain focus on search input during re-renders
  useEffect(() => {
    if (isTyping.current && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [scores, loading]);

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, sortBy, sortOrder, filterDuration]);

  useEffect(() => {
    fetchLeaderboard();
  }, [page, pageLength, debouncedSearchQuery, sortBy, sortOrder, filterDuration]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageLength;
      const durationParam = filterDuration !== 'all' ? parseInt(filterDuration) : null;
      const searchParam = debouncedSearchQuery.trim() || null;

      const { data, error } = await supabase.rpc('get_best_scores_per_user', {
        filter_duration_param: durationParam,
        search_query_param: searchParam,
        sort_by_param: sortBy,
        sort_order_param: sortOrder,
        page_offset: offset,
        page_limit: pageLength
      });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setScores([]);
        setTotalCount(0);
        return;
      }

      const entries = (data as LeaderboardEntry[]) || [];
      setScores(entries);
      setTotalCount(entries.length > 0 ? entries[0].total_count : 0);
    } catch (error) {
      console.error('Error:', error);
      setScores([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading leaderboard...</div>
          <div className="text-muted-foreground">Please wait while we fetch the scores</div>
        </div>
      </div>
    );
  }
 const totalPages = Math.ceil(totalCount / pageLength); 
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground mb-4">Top typing champions</p>
          <Button onClick={() => navigate('/')} variant="secondary">
            Back to Game
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search username..."
                  value={searchQuery}
                  onChange={(e) => {
                    isTyping.current = true;
                    setSearchQuery(e.target.value);
                  }}
                  onBlur={() => {
                    isTyping.current = false;
                  }}
                  className="pl-9"
                />
              </div>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wpm">WPM</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                  <SelectItem value="created_at">Date</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Highest First</SelectItem>
                  <SelectItem value="asc">Lowest First</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Duration */}
              <Select value={filterDuration} onValueChange={(value: any) => setFilterDuration(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Time mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Times</SelectItem>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Page Length Picker */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg shadow-sm">
            <label className="font-medium text-muted-foreground" htmlFor="page-length-picker">
              Page Length:
            </label>
            <select
              id="page-length-picker"
              className="border border-border bg-background rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={pageLength}
              onChange={e => {
                setPageLength(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 20, 30, 40, 50].map(len => (
                <option key={len} value={len}>{len}</option>
              ))}
            </select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Best Scores (Per User)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {debouncedSearchQuery.trim() ? 'No users found matching your search.' : 'No scores yet. Be the first to play!'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((score, index) => {
                  const rank = (page - 1) * pageLength + index + 1; // update rank calculation
                  const displayName = score.display_name || 'Anonymous';

                  // Only show trophies for top 3 on the first page
                  const showTrophy = page === 1 && rank <= 3;

                  return (
                    <div
                      key={score.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        showTrophy ? 'bg-accent/20' : 'bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {showTrophy ? getRankIcon(rank) : (
                          <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>
                        )}
                        <div>
                          <div className="font-semibold">{displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(score.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-right">
                        <div>
                          <div className="text-2xl font-bold text-primary">{score.wpm}</div>
                          <div className="text-xs text-muted-foreground">WPM</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-accent">{score.accuracy}%</div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-400">{score.correct_chars}</div>
                          <div className="text-xs text-muted-foreground">Correct</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-400">{score.duration}s</div>
                          <div className="text-xs text-muted-foreground">Time</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
           {/* Pagination Controls */}
            <div className="flex flex-col items-center gap-4 mt-6">
              <span className="text-sm text-muted-foreground">
                Showing {totalCount === 0 ? 0 : (page - 1) * pageLength + 1}
                {' - '}
                {Math.min(page * pageLength, totalCount)} of {totalCount}
              </span>
              
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    {/* First Page */}
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={page === 1}
                        onClick={() => setPage(1)}
                        aria-label="Go to first page"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                    
                    {/* Previous Page */}
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        aria-label="Go to previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </PaginationItem>

                    {/* Page Numbers */}
                    {(() => {
                      const pages: (number | 'ellipsis')[] = [];
                      
                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Always show first page
                        pages.push(1);
                        
                        if (page > 3) {
                          pages.push('ellipsis');
                        }
                        
                        // Show pages around current page
                        const start = Math.max(2, page - 1);
                        const end = Math.min(totalPages - 1, page + 1);
                        
                        for (let i = start; i <= end; i++) {
                          pages.push(i);
                        }
                        
                        if (page < totalPages - 2) {
                          pages.push('ellipsis');
                        }
                        
                        // Always show last page
                        pages.push(totalPages);
                      }
                      
                      return pages.map((p, idx) => (
                        <PaginationItem key={`${p}-${idx}`}>
                          {p === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => setPage(p)}
                              isActive={page === p}
                              className="cursor-pointer"
                            >
                              {p}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ));
                    })()}

                    {/* Next Page */}
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        aria-label="Go to next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                    
                    {/* Last Page */}
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={page === totalPages}
                        onClick={() => setPage(totalPages)}
                        aria-label="Go to last page"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>

        
        
      </div>
    </div>
  );
}