import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { MessageSquare, Send, X, AtSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Comment, User } from '../types';

interface CommentPopoverProps {
  elementId: string;
  comments: Comment[];
  onAddComment: (elementId: string, content: string, mentions: string[]) => void;
  users: User[];
}

export function CommentPopover({ 
  elementId, 
  comments, 
  onAddComment, 
  users 
}: CommentPopoverProps) {
  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewComment(value);
    
    const lastChar = value[e.target.selectionStart - 1];
    if (lastChar === '@') {
      setShowMentions(true);
      setMentionFilter('');
      setCursorPosition(e.target.selectionStart);
    } else if (showMentions) {
      const mentionText = value.slice(value.lastIndexOf('@') + 1, e.target.selectionStart);
      setMentionFilter(mentionText);
    }
  };

  const handleMention = (user: User) => {
    const beforeMention = newComment.slice(0, newComment.lastIndexOf('@'));
    const afterMention = newComment.slice(cursorPosition);
    setNewComment(`${beforeMention}@${user.name} ${afterMention}`);
    setShowMentions(false);
    setMentions([...mentions, user.id]);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(elementId, newComment, mentions);
      setNewComment('');
      setMentions([]);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          aria-label="Comments"
        >
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          {comments.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {comments.length}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-lg shadow-lg p-4 w-96 z-50"
          sideOffset={5}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900">Comments</h3>
            <Popover.Close className="text-gray-400 hover:text-gray-500">
              <X className="h-4 w-4" />
            </Popover.Close>
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {comment.content.split(' ').map((word, i) => (
                    word.startsWith('@') ? (
                      <span key={i} className="text-indigo-600 font-medium">{word} </span>
                    ) : (
                      word + ' '
                    )
                  ))}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowMentions(false);
                    }
                  }}
                  placeholder="Add a comment... Use @ to mention"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowMentions(true)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <AtSign className="h-4 w-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>

            {showMentions && (
              <div className="absolute bottom-full mb-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-32 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleMention(user)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-xs text-indigo-600">{user.name[0]}</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </button>
                ))}
              </div>
            )}
          </form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}