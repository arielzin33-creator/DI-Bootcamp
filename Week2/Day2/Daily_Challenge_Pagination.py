# items (default None): a list of items
# page_size (default 10): number of items per page
import math

class Pagination:
    def __init__ (self,items = None, page_size = 10):
        self.items = items if items is not None else []
        self.page_size = page_size
        self.current_idx = 0
        if self.items:
            self.total_pages = math.ceil(len(self.items) / self.page_size)
        else:
            self.total_pages = 0

    def get_visible_items(self):
        start = self.current_idx * self.page_size
        end = start + self.page_size
        return self.items[start:end]
    
# → Goes to the specified page number (1-based indexing).
# → If page_num is out of range, raise a ValueError.
    def go_to_page(self, page_num):
        if 0 <= page_num < self.total_pages:
            self.current_idx = page_num
        print("ValueError.")
    
    def first_page(self):
        if self.current_idx != 0:
            self.current_idx = 0
        else:
            print("You are already on the first page.")

    def last_page(self):
        if self.current_idx != -1:
            self.current_idx = -1
        else:
            print("You are already on the last page.")

    def next_page(self):
        if self.current_idx < self.total_pages - 1:
            self.current_idx += 1
        else:
            print("You are already on the last page.")

    def prev_page(self):
        if self.current_idx > 0:
            self.current_idx -= 1
        else:
            print("You are already on the first page.")

